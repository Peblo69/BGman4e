import { useState, useEffect } from 'react';
import { Lock, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useFirebaseAuth } from '../lib/firebase-auth-context';
import { AuthModal } from '../components/AuthModal';
import LoadingLogo from '../components/LoadingLogo';

// Utility function to highlight text wrapped in **asterisks**
const HighlightedText = ({ text }: { text: string }) => {
  // Regex to match text between double asterisks
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        // Check if this part is highlighted
        if (part.startsWith('**') && part.endsWith('**')) {
          // Extract text without asterisks and apply highlighting
          const highlightedText = part.slice(2, -2);
          return <span key={i} className="font-bold text-yellow-300">{highlightedText}</span>;
        }
        // Return regular text
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

// Content for the About Us page
const AboutUsContent = () => {
  return (
    <div className="bg-black/30 border border-white/10 rounded-xl p-6">
      {/* Donation button at the top */}
      <div className="flex justify-center mb-8">
        <a 
          href="https://buy.stripe.com/8wM7uH2A1d4G8Ok8wB"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <Heart className="w-5 h-5 text-red-300" />
          <span className="text-lg font-semibold">Подкрепете проекта</span>
        </a>
      </div>

      <article className="prose prose-invert prose-sm max-w-none">
        <h1 className="text-3xl font-bold mb-6 text-white">
          <HighlightedText text="**BulgarGPT** – Най-напредналият български GPT модел" />
        </h1>
        
        <h2 className="text-2xl font-bold mt-8 mb-4 text-purple-400">
          Въведение
        </h2>
        <p className="mb-4 leading-relaxed">
          BulgarGPT е най-напредналият български GPT модел, създаден с цел да подпомага българския народ чрез изкуствен интелект. Разработен от <HighlightedText text="**Kiara Intelligence**" />, този модел е резултат от дълга и усърдна работа. Създаден е, за да бъде напълно безплатен за употреба от всички в България и по света.
        </p>
        <p className="mb-4 leading-relaxed">
          BulgarGPT е обучен върху широка гама от теми и специализирани знания, което го прави полезен инструмент за решаване на проблеми, ежедневни задачи и вдъхновяващи разговори. Въпреки че моделът е изключително напреднал, са възможни грешки, тъй като продължава да се подобрява и оптимизира. Ако бъдат забелязани проблеми или има предложения за подобрения, ще се радваме на обратна връзка.
        </p>
        
        <hr className="my-8 border-white/10" />
        
        <h2 className="text-2xl font-bold mt-8 mb-4 text-purple-400">
          Kiara Intelligence – Визия и Мисия
        </h2>
        <p className="mb-4 leading-relaxed">
          Kiara Intelligence е компания, базирана в Амстердам, Нидерландия, с български произход. Въпреки че е позиционирана в чужбина, същността, екипът и мисията са <HighlightedText text="**изцяло български**" />. Целта е не просто създаване на изкуствен интелект, а изграждане на бъдещето на AI технологиите в България.
        </p>
        <p className="mb-4 leading-relaxed">
          Технологиите на Kiara Intelligence включват авангардни модели за обработка на естествен език, машинно зрение, създаване на изображения и AI анализ, способни да се конкурират с водещите решения в световен мащаб. Стремежът е изграждане на устойчива AI екосистема в България, която да бъде призната на международно ниво.
        </p>
        
        <hr className="my-8 border-white/10" />
        
        <h2 className="text-2xl font-bold mt-8 mb-4 text-purple-400">
          Цел и Подкрепа
        </h2>
        <p className="mb-4 leading-relaxed">
          Основната мисия на проекта е BulgarGPT да бъде широко разпространен и използван в България за положителни цели. Проектът е финансиран от Kiara Intelligence и в момента е <HighlightedText text="**безплатен за всички**" />.
        </p>
        <p className="mb-4 leading-relaxed">
          Всеки, който желае да подкрепи развитието на модела, може да го направи чрез дарения, подпомагащи по-нататъшната му еволюция. Най-добрият начин да бъде подкрепен проектът е чрез ползване и споделяне на платформата.
        </p>
        <p className="mb-4 leading-relaxed">
          Целта не е просто да бъде предложен AI инструмент, а да се помогне за развитието на България чрез подкрепа на ученици, студенти, бизнеси и хора в трудни моменти. BulgarGPT е създаден да бъде винаги на разположение – интелигентен помощник, ориентиран към България.
        </p>
        
        <hr className="my-8 border-white/10" />
        
        <h2 className="text-2xl font-bold mt-8 mb-4 text-purple-400">
          Функции на Платформата
        </h2>
        <h3 className="text-xl font-semibold mt-6 mb-3 text-blue-400">
          Какво предлага BulgarGPT?
        </h3>
        <p className="mb-4 leading-relaxed">
          Моделът е базиран на <HighlightedText text="**KiaraVision X**" /> – специално адаптирана версия от Kiara Intelligence, която предоставя прецизни отговори на български език и усъвършенствано разпознаване на изображения.
        </p>
        
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Висококачествени AI отговори, адаптирани за българския език и култура</li>
          <li>Разпознаване и интерпретация на изображения</li>
          <li>Генериране на изображения чрез модели от световно ниво</li>
          <li>AI за кодиране с разбиране на множество програмни езици и решаване на сложни задачи</li>
        </ul>
        
        <p className="mb-4 leading-relaxed">
          Текущата версия е нова и е възможно да съдържа несъвършенства. Екипът работи активно по подобрения, като всяка обратна връзка е ценна.
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-3 text-blue-400">
          Kiara Dominator X+ – Дълбокоразсъждаващ AI модел
        </h3>
        <p className="mb-4 leading-relaxed">
          Една от най-силните страни на BulgarGPT е <HighlightedText text="**Kiara Dominator X+**" />, разработен от Kiara Intelligence. Моделът е конкурентен на най-мощните reasoning системи в света.
        </p>
        
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Дълбок анализ на информация</li>
          <li>Решаване на сложни задачи</li>
          <li>Висок клас AI кодиране, полезно за професионални програмисти</li>
        </ul>
        
        <p className="mb-4 leading-relaxed">
          Важно: Kiara Dominator X+ не е официално пуснат. При достатъчна подкрепа на проекта BulgarGPT, достъпът до него може да бъде предоставен на по-широка аудитория.
        </p>
        
        <hr className="my-8 border-white/10" />
        
        <h2 className="text-2xl font-bold mt-8 mb-4 text-purple-400">
          Общи Условия за Ползване (Terms of Service)
        </h2>
        
        <h3 className="text-xl font-semibold mt-6 mb-3 text-blue-400">
          Приемане на условията
        </h3>
        <p className="mb-4 leading-relaxed">
          С използването на BulgarGPT потребителите автоматично приемат тези условия.
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-3 text-blue-400">
          Отговорност на потребителите
        </h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Платформата не може да бъде използвана за незаконни или неетични цели</li>
          <li>Забранява се разпространение на вредно съдържание, дезинформация или нарушаване на чужди права</li>
          <li>Потребителите трябва критично да оценяват предоставената от модела информация</li>
        </ul>
        
        <h3 className="text-xl font-semibold mt-6 mb-3 text-blue-400">
          Ограничения и риск
        </h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Kiara Intelligence не носи отговорност за вреди, произтичащи от използването на AI</li>
          <li>BulgarGPT не предоставя експертни съвети в области като медицина, финанси или право</li>
        </ul>
        
        <h3 className="text-xl font-semibold mt-6 mb-3 text-blue-400">
          Промени в услугата
        </h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Kiara Intelligence може да променя функционалността на платформата по всяко време</li>
          <li>В бъдещи версии е възможно ограничаване на безплатния достъп</li>
        </ul>
        
        <h3 className="text-xl font-semibold mt-6 mb-3 text-blue-400">
          Дарения и подкрепа
        </h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Потребителите могат доброволно да подкрепят проекта чрез дарения</li>
          <li>Средствата се използват за подобряване и разширяване на възможностите на AI системата</li>
        </ul>
        
        <h3 className="text-xl font-semibold mt-6 mb-3 text-blue-400">
          Контакти и Връзка с Нас
        </h3>
        <p className="mb-4 leading-relaxed">
          Ако възникнат въпроси, проблеми или има предложения за подобрения, може да се осъществи връзка с екипа на Kiara Intelligence.
        </p>
        <p className="mb-4 leading-relaxed">
          Официален имейл за контакт: <a href="mailto:kiaraintelligence@outlook.com" className="text-purple-400 hover:text-purple-300">kiaraintelligence@outlook.com</a>
        </p>
        <p className="mb-4 leading-relaxed">
          Обратната връзка и подкрепата на потребителите са от ключово значение за развитието на проекта BulgarGPT.
        </p>
        
        <hr className="my-8 border-white/10" />
        
        <h2 className="text-2xl font-bold mt-8 mb-4 text-purple-400">
          Заключение
        </h2>
        <p className="mb-4 leading-relaxed">
          BulgarGPT е крачка напред за българския AI свят. Проектът цели предоставяне на <HighlightedText text="**най-качествения изкуствен интелект**" /> на българския народ, напълно безплатно.
        </p>
        <p className="mb-4 leading-relaxed">
          Подкрепата на потребителите е решаваща – чрез ползване, споделяне или дарения. Благодарим за доверието и че сте част от развитието на изкуствения интелект в България!
        </p>
        
        {/* Donation button at the bottom */}
        <div className="flex justify-center mt-8">
          <a 
            href="https://buy.stripe.com/8wM7uH2A1d4G8Ok8wB"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Heart className="w-5 h-5 text-red-300" />
            <span className="text-lg font-semibold">Подкрепете проекта</span>
          </a>
        </div>
      </article>
    </div>
  );
};

function AboutPage() {
  const { user, isLoading } = useFirebaseAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  
  // Handle loading state
  useEffect(() => {
    // Set a timeout to ensure page is shown even if auth takes too long
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Handle authentication check - show auth modal instead of redirection
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setIsAuthModalOpen(true);
      }
      // Mark the page as loaded after auth check
      setPageLoaded(true);
    }
  }, [user, isLoading]);

  // When the user is not authenticated, show a special placeholder
  if (isLoading && !pageLoaded) {
    return <LoadingLogo message="Зареждане..." fullScreen={true} />;
  }

  if (!user && pageLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-xl text-center px-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-8 mb-6">
            <Lock className="w-16 h-16 mx-auto text-purple-400 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Нужен е акаунт</h1>
            <p className="text-lg text-muted-foreground mb-6">
              За да достъпите тази страница, моля, създайте безплатен акаунт или влезте във вашия съществуващ профил.
            </p>
            <Button 
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-6"
              size="lg"
            >
              Вход / Регистрация
            </Button>
          </div>
        </div>
        
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-8">
      <h1 className="text-3xl font-bold mb-6">За Нас</h1>
      
      <div className="max-w-4xl mx-auto overflow-y-auto custom-scrollbar" style={{ height: 'calc(100vh - 160px)' }}>
        {pageLoaded ? <AboutUsContent /> : <LoadingLogo message="Зареждане на съдържание..." />}
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default AboutPage;