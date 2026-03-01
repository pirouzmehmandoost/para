const CommandPalette = (props) => {

  const { 
    pathname 
  } = props;

  const cond = pathname?.length && pathname.startsWith('/projects/');

  if (!pathname) return null;

  return (
    <div className='fixed mt-5 ml-24 text-sm text-neutral-800'>
      <ul>
        {!cond && <li> Browse → swipe left/right </li> }
        {!cond && <li> Focus model → click model </li> }
        {!cond && <li> Open details → Focus model → click “View Details” </li> }
        <li> Close details → Esc or Back Arrow Button </li>
        <li> Exit focus → Esc </li>
      </ul>
    </div>
  );
};

export default CommandPalette;