import { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';

// @ts-ignore
const Player = ({ option, getInstance, ...rest }) => {
  const artRef = useRef();

  useEffect(() => {
    const art = new Artplayer({
      ...option,
      container: artRef.current,
    });
    if (getInstance && typeof getInstance === 'function') {
      getInstance(art);
    }
    let b = 1;

    function hotkeyEvent(event: any) {
      
      b = art.playbackRate;
      if (b === 3) {
        b = 1;
      } else if (b === 1) {
        b = b + 0.25;
      } else if (b === 1.5) {
        b = b + 0.5;
      } else if (b === 1.25) {
        b = b + 0.25;
      } else {
        b = b + 1;
      }
      art.playbackRate = b;
    }

    art.on('ready', () => {
      console.log('快捷调节倍数')
      art.hotkey.add(75, hotkeyEvent);
    });

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, [option]);

  // @ts-ignore
  return <div ref={artRef} {...rest}></div>;
};
export default Player;
