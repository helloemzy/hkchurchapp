'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/alert';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'zh-HK' | 'zh-CN';
}

export function PrivacyPolicyModal({ isOpen, onClose, language = 'en' }: PrivacyPolicyModalProps) {
  const [currentSection, setCurrentSection] = useState('overview');

  if (!isOpen) return null;

  const content = getPrivacyPolicyContent(language);

  const sections = [
    { id: 'overview', title: content.sections.overview.title },
    { id: 'data-collection', title: content.sections.dataCollection.title },
    { id: 'data-use', title: content.sections.dataUse.title },
    { id: 'data-sharing', title: content.sections.dataSharing.title },
    { id: 'data-security', title: content.sections.dataSecurity.title },
    { id: 'user-rights', title: content.sections.userRights.title },
    { id: 'cookies', title: content.sections.cookies.title },
    { id: 'children', title: content.sections.children.title },
    { id: 'updates', title: content.sections.updates.title },
    { id: 'contact', title: content.sections.contact.title },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {content.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {content.lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Navigation */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    currentSection === section.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="prose dark:prose-invert max-w-none">
              {renderSection(content.sections, currentSection)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <Button variant="primary" onClick={onClose}>
              {content.closeButton}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderSection(sections: any, currentSection: string) {
  const section = sections[currentSection.replace('-', '')];
  if (!section) return null;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        {section.title}
      </h3>
      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        {section.content.map((paragraph: string, index: number) => (
          <p key={index}>{paragraph}</p>
        ))}
        {section.items && (
          <ul className="list-disc list-inside space-y-2">
            {section.items.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function getPrivacyPolicyContent(language: string) {
  if (language === 'zh-HK' || language === 'zh-CN') {
    return {
      title: '私隱政策',
      lastUpdated: '最後更新：2025年1月6日',
      closeButton: '關閉',
      sections: {
        overview: {
          title: '概述',
          content: [
            '歡迎使用香港恩典教會流動應用程式。我們重視您的私隱，並致力於保護您的個人資料。',
            '本私隱政策說明我們如何收集、使用、披露和保護您在使用我們的服務時提供的資訊。',
            '使用我們的服務即表示您同意本政策中描述的做法。',
          ],
        },
        dataCollection: {
          title: '資料收集',
          content: [
            '我們收集以下類型的資訊：',
          ],
          items: [
            '個人識別資訊：姓名、電郵地址、電話號碼',
            '帳戶資訊：用戶名、個人資料、偏好設定',
            '使用資料：應用程式使用模式、功能互動',
            '技術資訊：設備資訊、IP地址、瀏覽器類型',
            '位置資料：如您同意，我們可能收集位置資訊用於活動通知',
          ],
        },
        dataUse: {
          title: '資料使用',
          content: [
            '我們使用您的資料來：',
          ],
          items: [
            '提供和維護我們的服務',
            '改善用戶體驗和應用程式功能',
            '發送重要通知和更新',
            '提供客戶支援',
            '進行安全監控和欺詐預防',
            '遵守法律義務',
          ],
        },
        dataSharing: {
          title: '資料分享',
          content: [
            '我們不會出售您的個人資料。我們僅在以下情況下分享您的資訊：',
          ],
          items: [
            '經您明確同意',
            '與可信任的服務提供商（如託管、分析）',
            '遵守法律要求或法院命令',
            '保護我們的權利、財產或安全',
            '在業務轉讓的情況下',
          ],
        },
        dataSecurity: {
          title: '資料安全',
          content: [
            '我們實施行業標準的安全措施來保護您的資料：',
          ],
          items: [
            'SSL/TLS加密傳輸',
            '靜態資料加密',
            '定期安全審計',
            '訪問控制和身份驗證',
            '安全事故監控',
            '定期備份和災難恢復',
          ],
        },
        userRights: {
          title: '您的權利',
          content: [
            '根據適用的私隱法律，您擁有以下權利：',
          ],
          items: [
            '查看我們持有的您的個人資料',
            '更正不準確的資料',
            '刪除您的個人資料（被遺忘權）',
            '限制資料處理',
            '資料可攜性',
            '反對處理',
            '撤回同意（如適用）',
          ],
        },
        cookies: {
          title: 'Cookie和追蹤',
          content: [
            '我們使用Cookie和類似技術來：',
          ],
          items: [
            '記住您的偏好和設定',
            '分析網站使用情況',
            '提供個人化內容',
            '改善安全性',
            '啟用社交媒體功能',
          ],
        },
        children: {
          title: '兒童私隱',
          content: [
            '我們特別注重保護18歲以下人士的私隱：',
          ],
          items: [
            '收集兒童資料前需要家長同意',
            '限制兒童資料的收集和使用',
            '家長可以查看、修改或刪除其子女的資料',
            '遵循香港個人資料私隱條例的兒童保護規定',
          ],
        },
        updates: {
          title: '政策更新',
          content: [
            '我們可能會不時更新本私隱政策。重大更改時，我們會：',
          ],
          items: [
            '通過電郵或應用程式通知您',
            '在網站上發布更新的政策',
            '提供30天的過渡期',
            '記錄更改的有效日期',
          ],
        },
        contact: {
          title: '聯絡我們',
          content: [
            '如果您對本私隱政策有任何疑問或要求行使您的權利，請聯絡我們：',
            '電郵：privacy@gracechurch.hk',
            '電話：+852 2234 5678',
            '地址：香港中環皇后大道中123號',
            '私隱主任：李牧師',
          ],
        },
      },
    };
  }

  // English content
  return {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: January 6, 2025',
    closeButton: 'Close',
    sections: {
      overview: {
        title: 'Overview',
        content: [
          'Welcome to the Grace Church Hong Kong mobile application. We value your privacy and are committed to protecting your personal information.',
          'This Privacy Policy explains how we collect, use, disclose, and safeguard information you provide when using our services.',
          'By using our services, you consent to the practices described in this policy.',
        ],
      },
      datacollection: {
        title: 'Data Collection',
        content: [
          'We collect the following types of information:',
        ],
        items: [
          'Personal identifiers: Name, email address, phone number',
          'Account information: Username, profile data, preferences',
          'Usage data: App usage patterns, feature interactions',
          'Technical information: Device info, IP address, browser type',
          'Location data: With your consent, we may collect location for event notifications',
        ],
      },
      datause: {
        title: 'Data Use',
        content: [
          'We use your information to:',
        ],
        items: [
          'Provide and maintain our services',
          'Improve user experience and app functionality',
          'Send important notifications and updates',
          'Provide customer support',
          'Conduct security monitoring and fraud prevention',
          'Comply with legal obligations',
        ],
      },
      datasharing: {
        title: 'Data Sharing',
        content: [
          'We do not sell your personal information. We share your information only in the following circumstances:',
        ],
        items: [
          'With your explicit consent',
          'With trusted service providers (hosting, analytics)',
          'To comply with legal requirements or court orders',
          'To protect our rights, property, or safety',
          'In case of business transfer',
        ],
      },
      datasecurity: {
        title: 'Data Security',
        content: [
          'We implement industry-standard security measures to protect your data:',
        ],
        items: [
          'SSL/TLS encryption in transit',
          'Encryption at rest',
          'Regular security audits',
          'Access controls and authentication',
          'Security incident monitoring',
          'Regular backups and disaster recovery',
        ],
      },
      userrights: {
        title: 'Your Rights',
        content: [
          'Under applicable privacy laws, you have the following rights:',
        ],
        items: [
          'Access personal data we hold about you',
          'Correct inaccurate information',
          'Delete your personal data (right to be forgotten)',
          'Restrict data processing',
          'Data portability',
          'Object to processing',
          'Withdraw consent (where applicable)',
        ],
      },
      cookies: {
        title: 'Cookies and Tracking',
        content: [
          'We use cookies and similar technologies to:',
        ],
        items: [
          'Remember your preferences and settings',
          'Analyze website usage',
          'Provide personalized content',
          'Improve security',
          'Enable social media features',
        ],
      },
      children: {
        title: "Children's Privacy",
        content: [
          'We take special care to protect the privacy of individuals under 18:',
        ],
        items: [
          'Parental consent required before collecting children\'s data',
          'Limited collection and use of children\'s information',
          'Parents can review, modify, or delete their child\'s data',
          'Compliance with Hong Kong PDPO child protection provisions',
        ],
      },
      updates: {
        title: 'Policy Updates',
        content: [
          'We may update this Privacy Policy from time to time. For significant changes, we will:',
        ],
        items: [
          'Notify you via email or app notification',
          'Post the updated policy on our website',
          'Provide a 30-day transition period',
          'Record the effective date of changes',
        ],
      },
      contact: {
        title: 'Contact Us',
        content: [
          'If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:',
          'Email: privacy@gracechurch.hk',
          'Phone: +852 2234 5678',
          'Address: 123 Queen\'s Road Central, Hong Kong',
          'Data Protection Officer: Pastor Li',
        ],
      },
    },
  };
}