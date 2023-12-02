import { ReactNode, useState } from 'react';

type CarouselParams = {
  children?: ReactNode[];
};
export const Carousel = ({ children }: CarouselParams) => {
  const [index, setIndex] = useState(0);

  return (
    <div
      className="duration-300 transition-transform flex inline-block relative h-[70vh] w-[70vw]"
      style={{ transform: `translateX(calc(${index} * -70vw))` }}
    >
      {children?.map((child, i) => (
        <SlideFrame onClick={() => setIndex(i)} key={i}>
          {child}
        </SlideFrame>
      ))}
    </div>
  );
};

type SlideFrameParams = {
  children?: ReactNode;
  onClick?: () => void;
};

const SlideFrame = ({ children, onClick }: SlideFrameParams) => {
  return (
    <div onClick={onClick} className="p-4 flex-none h-[70vh] w-[70vw]">
      <div className="w-full h-full rounded-3xl overflow-hidden">
        {children}
      </div>
    </div>
  );
};
