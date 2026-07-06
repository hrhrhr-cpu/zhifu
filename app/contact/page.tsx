import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '联系我们 - 影视会员',
  description: '有任何问题或建议？请随时联系我们',
};

export default function ContactPage() {
  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
      <div className="pt-32 pb-12 md:pt-40 md:pb-20">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center">
          <h1 className="h1 font-playfair-display text-center mb-8">联系我们</h1>

          <div className="text-lg text-gray-600 mb-8 w-full text-center">
            <p className="mb-8">
              我们很乐意听取您的意见、建议或问题。请通过以下方式联系我们，我们会尽快回复。
            </p>

            <div className="bg-gray-50 p-8 rounded-lg max-w-xl mx-auto shadow-sm">
              <h2 className="h4 font-playfair-display mb-6 text-center">联系方式</h2>
              <ul className="space-y-6 flex flex-col items-center">
                <li className="flex flex-col items-center">
                  <svg className="w-6 h-6 text-blue-600 mb-2" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" />
                    <path d="M9 4H7v5h5V7H9z" />
                  </svg>
                  <span className="text-center">工作时间: 周一至周五 9:00 - 18:00</span>
                </li>
                <li className="flex flex-col items-center">
                  <svg className="w-6 h-6 text-blue-600 mb-2" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.9 7v2.4H12c-.2 1-1.2 3-4 3-2.4 0-4.3-2-4.3-4.4 0-2.4 2-4.4 4.3-4.4 1.4 0 2.3.6 2.8 1.1l1.9-1.8C11.5 1.7 9.9 1 8 1 4.1 1 1 4.1 1 8s3.1 7 7 7c4 0 6.7-2.8 6.7-6.8 0-.5 0-.8-.1-1.2H7.9z" />
                  </svg>
                  <span className="text-center">邮箱: abc@123.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
