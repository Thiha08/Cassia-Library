export interface Point { x: number; y: number; }

export interface CircleOpts {
  radius: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface SquareOpts {
  size: number;           // Side length of the square
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface CardOpts {
  width: number;
  height: number;
  margin: number;
  radius: number;
  bgColor: string;
  textColor: string;
  font: string;
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number; };
}
export interface WaveOpts {
  color: string;
  width: number;
  dash?: number[];         // e.g. [8,4]
  speed?: number;          // how fast dash offset moves
  gradient?: { from: string; to: string; };
}

export class CustomRenderer {
  /** 1. Zoom-scaled inner+outer circles */
  static drawCircle(
    ctx: CanvasRenderingContext2D,
    pt: Point,
    zoom: number,
    opts: CircleOpts
  ) {
    const zoomedRadius = opts.radius * (1.5 + zoom * 0.1);
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, zoomedRadius, 0, 2 * Math.PI);
    ctx.fillStyle = opts.fillColor;
    ctx.fill();
    ctx.lineWidth = opts.strokeWidth;
    ctx.strokeStyle = opts.strokeColor;
    ctx.stroke();
    ctx.restore();
  }

  /** 2. Cards laid out along the right border, sorted by feature.get(sortKey) */
  static drawCardsOnRight(
    ctx: CanvasRenderingContext2D,
    size: [number, number],
    features: any[],               // array of { feature, sortValue }
    keyCoordMap: Map<any, Point>,  // precomputed map: feature→the pt to connect back
    sortKey: string,
    opts: CardOpts
  ) {
    // sort by sortValue ascending (e.g. time)
    features.sort((a, b) => a.sortValue - b.sortValue);

    features.forEach((entry, idx) => {
      const { feature, sortValue } = entry;
      const cardX = size[0] - opts.margin - opts.width;
      const cardY = opts.margin + idx * (opts.height + opts.margin);

      // background
      if (opts.shadow) {
        ctx.save();
        ctx.shadowColor = opts.shadow.color;
        ctx.shadowBlur = opts.shadow.blur;
        ctx.shadowOffsetX = opts.shadow.offsetX;
        ctx.shadowOffsetY = opts.shadow.offsetY;
      }
      ctx.fillStyle = opts.bgColor;
      ctx.beginPath();
      CustomRenderer.roundRect(ctx, cardX, cardY, opts.width, opts.height, opts.radius);
      ctx.fill();
      if (opts.shadow) ctx.restore();

      // text
      const desc = feature.get('description') || '';
      const txt = desc.length > 30 ? desc.slice(0, 27) + '…' : desc;
      ctx.save();
      ctx.fillStyle = opts.textColor;
      ctx.font = opts.font;
      ctx.textBaseline = 'top';
      ctx.fillText(txt, cardX + 10, cardY + 10);
      ctx.restore();

      // store card center for connector drawing
      const cardCenter: Point = {
        x: cardX + opts.width / 2,
        y: cardY + opts.height,
      };
      keyCoordMap.set(feature, cardCenter);
    });
  }

  /** 3. A wavy (or dashed) connector between two points, optionally animated */
  static drawWaveConnector(
    ctx: CanvasRenderingContext2D,
    from: Point,
    to: Point,
    time: number,       // pass frameState.time
    opts: WaveOpts
  ) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    const segments = 50;
    const amplitude = 5;

    // build a sine‐wave polyline
    const path: Point[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = from.x + dx * t;
      const y =
        from.y + dy * t +
        Math.sin(t * Math.PI * 4) * amplitude;
      path.push({ x, y });
    }

    ctx.save();
    // if gradient requested
    if (opts.gradient) {
      const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
      grad.addColorStop(0, opts.gradient.from);
      grad.addColorStop(1, opts.gradient.to);
      ctx.strokeStyle = grad;
    } else {
      ctx.strokeStyle = opts.color;
    }
    ctx.lineWidth = opts.width;

    if (opts.dash && opts.speed) {
      ctx.setLineDash(opts.dash);
      ctx.lineDashOffset = -((time / 1000) * opts.speed) % (opts.dash[0] + opts.dash[1]);
    }

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let pt of path) {
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  /** Utility: rounded‐rectangle path */
  static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /** generate an off‐screen canvas with diagonal stripes */
  static createDiagonalStripePattern(): CanvasPattern {
    const size = 8;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!;
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(size, 0);
    ctx.stroke();
    return ctx.createPattern(c, 'repeat')!;
  }

  /** 1. Zoom-scaled square */
  static drawSquare(
    ctx: CanvasRenderingContext2D,
    pt: Point,
    zoom: number,
    opts: SquareOpts
  ) {
    const zoomedSize = opts.size * (1.5 + zoom * 0.1);
    const halfSize = zoomedSize / 2;

    ctx.save();
    ctx.beginPath();
    // Draw square centered on the point
    ctx.rect(pt.x - halfSize, pt.y - halfSize, zoomedSize, zoomedSize);
    ctx.fillStyle = opts.fillColor;
    ctx.fill();
    ctx.lineWidth = opts.strokeWidth;
    ctx.strokeStyle = opts.strokeColor;
    ctx.stroke();
    ctx.restore();
  }
}
