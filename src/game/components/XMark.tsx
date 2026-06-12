// import xUrl from '../../../assets/x.svg';

interface Props {
  isRecommendationPreview: boolean;
}

export function XMark({ isRecommendationPreview }: Props): React.ReactNode {
  const shouldAnimate = !isRecommendationPreview;

  const classes = [
    'x-mark',
    ...(shouldAnimate ? ['animated-x'] : []),
    ...(isRecommendationPreview ? ['preview'] : []),
  ];

  return (
    <div className={classes.join(' ')}>
      {/* <img className="animated-x-image" src={xUrl} draggable={false} /> */}
      <svg viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
        <g>
          <line
            x1="5"
            y1="5"
            x2="20"
            y2="20"
            pathLength="1"
            className="stroke downstroke"
            fill="none"
            stroke="#000000"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
          <line
            x1="5"
            y1="20"
            x2="20"
            y2="5"
            pathLength="1"
            className="stroke upstroke"
            fill="none"
            stroke="#000000"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </g>
      </svg>
    </div>
  );
}
