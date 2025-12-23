import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';




export default function Header() {
  const { t } = useTranslation();
  const headerRef = useRef<HTMLElement|null>(null);

  const handleClick = (event: Event) => {
    // close any open dropdown
    const $clickedDropdown = (event.target as HTMLElement).closest('.js-dropdown');
    const $dropdowns = headerRef.current!.querySelectorAll('.js-dropdown');
    $dropdowns.forEach(($dropdown:Element) => {
      if ($clickedDropdown !== $dropdown && $dropdown.getAttribute('data-dropdown-keepopen') !== 'true') {
        $dropdown.ariaExpanded = 'false';
        $dropdown.nextElementSibling!.classList.add('hidden');
      }
    });
    // toggle selected if applicable
    if ($clickedDropdown) {
      $clickedDropdown.ariaExpanded = '' + ($clickedDropdown.ariaExpanded !== 'true');
      $clickedDropdown.nextElementSibling!.classList.toggle('hidden');
    }
  };

  useEffect(() => {
    document.body.addEventListener('click', handleClick);
    return () => document.body.removeEventListener('click', handleClick);
  }, []);

  return (
    <header ref={headerRef} className="bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex flex-wrap items-center justify-between py-2">
          <Link to="/" className="flex items-center py-1.5 mr-4">
            <img src="/images/logo.png" alt={t('app.title')} width="60" height="60" className="inline-block" />
            <span className="text-xl pl-3">{t('app.title')}</span>
          </Link>
          <button type="button" className="js-dropdown md:hidden border rounded cursor-pointer" data-dropdown-keepopen="true"
              aria-label={t('navigation.toggle')} aria-controls="navbarToggle" aria-expanded="false">
            <div className="space-y-1.5 my-2.5 mx-4">
              <div className="w-6 h-0.5 bg-gray-500"></div>
              <div className="w-6 h-0.5 bg-gray-500"></div>
              <div className="w-6 h-0.5 bg-gray-500"></div>
            </div>
          </button>
          <div className="hidden md:block flex grow md:grow-0 justify-end basis-full md:basis-auto pt-3 md:pt-1 pb-1" id="navbarToggle">
            <ul className="flex">
              <li>
                <Link to="/home" className="block text-gray-500 p-2">{t('navigation.home')}</Link>
              </li>
              <li className="relative">
                <button type="button" className="js-dropdown block text-gray-500 p-2 cursor-pointer" id="navbarQuestionLink"
                    aria-expanded="false">
                  <span>{t('navigation.question')}</span>
                  <span className="text-[9px] align-[3px] pl-0.5">&#9660;</span>
                </button>
                <ul className="hidden block absolute left-0 bg-white border border-gray-300 rounded min-w-[10rem] py-2" aria-labelledby="navbarQuestionLink">
                  <li><Link to="/questions" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('question.list.headline')}</Link></li>
                  <li><Link to="/upload" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('navigation.upload')}</Link></li>
                  <li><Link to="/q-extract" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('question.extract.headline')}</Link></li>
                </ul>
              </li>
              <li>
                
              </li>
              <li className="relative">
                <button type="button" className="js-dropdown block text-gray-500 p-2 cursor-pointer" id="navbarSettingsLink"
                    aria-expanded="false">
                  <span>{t('navigation.settings')}</span>
                  <span className="text-[9px] align-[3px] pl-0.5">&#9660;</span>
                </button>
                <ul className="hidden block absolute right-0 bg-white border border-gray-300 rounded min-w-[10rem] py-2" aria-labelledby="navbarSettingsLink">
                  <li><Link to="/providerTypes" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('providerType.list.headline')}</Link></li>
                  <li><Link to="/contentProviders" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('contentProvider.list.headline')}</Link></li>
                  <li><Link to="/exams" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('exam.list.headline')}</Link></li>
                  <li><Link to="/categories" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('category.list.headline')}</Link></li>
                  <li><Link to="/qSets" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('qSet.list.headline')}</Link></li>
                  <li><Link to="/tags" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('tag.list.headline')}</Link></li>
                </ul>
              </li>
              <li className="relative">
                <button type="button" className="js-dropdown block text-gray-500 p-2 cursor-pointer" id="navbarAccessLink"
                    aria-expanded="false">
                  <span>{t('navigation.access')}</span>
                  <span className="text-[9px] align-[3px] pl-0.5">&#9660;</span>
                </button>
                <ul className="hidden block absolute right-0 bg-white border border-gray-300 rounded min-w-[10rem] py-2" aria-labelledby="navbarAccessLink">
                  <li><Link to="/users" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('user.list.headline')}</Link></li>
                  <li><Link to="/roles" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('role.list.headline')}</Link></li>
                  <li><Link to="/assignUsers" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('role.assignUsers.headline')}</Link></li>
                  <li><Link to="/resources" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('resource.list.headline')}</Link></li>
                  <li><Link to="/permissions" className="inline-block w-full hover:bg-gray-200 px-4 py-1">{t('permission.list.headline')}</Link></li>
                </ul>
              </li>
              <li>
                
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
