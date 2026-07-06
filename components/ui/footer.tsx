import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-8 md:py-12">
          {/* Top area */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between mb-12 md:mb-6">
            <div className="shrink-0 mr-4">
              {/* Logo */}
              <Link
                className="inline-flex group mb-8 sm:mb-0"
                href="/"
                aria-label="影视会员"
              >
                <svg
                  viewBox="0 0 1448 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="8751"
                  width="32"
                  height="32"
                >
                  <path
                    d="M830.69204102 777.369332l202.7441114 56.71889982-121.01084855-238.24035081 183.64319921-225.03735499-274.93274359 65.81173664-134.8132156-222.91560675-54.13888506 278.11212959-273.86863313 93.41258714 201.68388457 87.04345884-136.93108022 92.35106576-162.41277156-68.99759534s-89.1665016-40.33651801-89.1665016-110.39563472 91.28954437-94.47281398 91.28954436-94.47281399l270.68406899-84.21100911 45.29330505-263.25083022s21.23042765-104.73720795 93.41258714-104.73720794 101.90475821 83.50548575 138.70589219 138.70589219l75.01202014 125.96504652 268.91572969-70.76852369s220.78997491-46.7056463 89.16650162 141.52928016l-191.07255435 223.62630826 113.22290631 220.7899749s87.75157129 179.7531117-118.88910033 155.68505617l-195.31475626-62.27635263-21.23042765-134.46110119z"
                    fill="#3b82f6"
                    p-id="8752"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>
          {/* Bottom area */}
          <div className="text-center md:flex md:items-center md:justify-between mb-8 md:mb-6">
            {/* Left links */}
            <div className="text-sm font-medium md:order-1 space-x-6 mb-2 md:mb-0">
              <Link
                className="text-gray-500 decoration-blue-600 decoration-2 underline-offset-2 hover:underline"
                href="/about"
              >
                关于我们
              </Link>
              <Link
                className="text-gray-500 decoration-blue-600 decoration-2 underline-offset-2 hover:underline"
                href="/contact"
              >
                联系我们
              </Link>
              <Link
                className="text-gray-500 decoration-blue-600 decoration-2 underline-offset-2 hover:underline"
                href="/privacy"
              >
                隐私条款
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
