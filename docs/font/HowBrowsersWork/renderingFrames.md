# 渲染帧

手机、电脑，它们的默认刷新频率都是 60FPS，也就是屏幕在 1s 内渲染 60 次，约 16.7ms 渲染一次屏幕。这就意味着，我们的浏览器最佳的渲染性能就是所有的操作在一帧 16.7ms 内完成，能否做到一帧内完成直接决定着渲染性，影响用户交互。浏览器的 fps 指浏览器每一秒的帧数，fps 越大，每秒的画面就越多，浏览器的显示就越流畅。

<img src="/img/HowBrowsersWork/渲染帧.webp" alt="渲染帧"  />

<span style='color:red'>标准渲染帧</span>:在一个标准帧渲染时间 16.7ms 之内，浏览器需要完成主线程的操作，并 commit 给 Compositor 进程

在 Chrome 浏览器中,合成和渲染的处理方式如下:

<span style='color:red'>渲染进程</span>: Chrome 的渲染进程确实包含一个合成线程,负责将页面元素合成为最终的帧。
合成线程接收来自主线程的更新信息(如 DOM 变化、动画等),并将其合成为中间结果。

<span style='color:red'>Compositor 进程</span>: Chrome 同时拥有一个独立的 Compositor 进程,专门负责页面的最终合成和渲染。

渲染进程将中间合成结果传递给 Compositor 进程,由 Compositor 进程完成最终的合成和光栅化操作。

Compositor 进程可以充分利用 GPU 加速来提高合成性能。

<span style='color:red'>进程间通信</span>:主线程和合成线程在渲染进程内部进行通信。
渲染进程将中间合成结果通过 IPC (进程间通信) 传递给 Compositor 进程。
