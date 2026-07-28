__ZN24FFPlayerLockDeferredWorkD1Ev:
0000000000da7f10	pushq	%rbp
0000000000da7f11	movq	%rsp, %rbp
0000000000da7f14	pushq	%rbx
0000000000da7f15	subq	$0x18, %rsp
0000000000da7f19	movq	%rdi, %rbx
0000000000da7f1c	movq	0x8(%rdi), %rdi
0000000000da7f20	movq	0xe10629(%rip), %rsi
0000000000da7f27	callq	*0xb45793(%rip)                 ## Objc message: -[%rdi _waitForThreadToFinish]
0000000000da7f2d	testq	%rax, %rax
0000000000da7f30	je	0xda7f71
0000000000da7f32	leaq	0x8b7bc3(%rip), %rax            ## literal pool for: "FFPlayerLockDeferredWork::~FFPlayerLockDeferredWork()"
0000000000da7f39	movq	%rax, 0x8(%rsp)
0000000000da7f3e	leaq	0x8b7ba0(%rip), %rax            ## literal pool for: "[_workToDo count] == 0"
0000000000da7f45	movq	%rax, (%rsp)
0000000000da7f49	leaq	0x8b7b28(%rip), %rdx            ## literal pool for: "/Library/Caches/com.apple.xbs/Sources/Flexo/Flexo-45000.0.121/framework/playback/FFPlayerLockingUtilities.mm"
0000000000da7f50	leaq	0x84fb1e(%rip), %r8             ## literal pool for: "assertion failed: %s (%s) :: %s"
0000000000da7f57	leaq	0x8b7a84(%rip), %r9             ## literal pool for: "FFPlayerLockDeferredWork::~FFPlayerLockDeferredWork - Didn't process workToDoUponLocking. Please call processDeferredWork before the destructor runs!"
0000000000da7f5e	movl	$0x1, %edi
0000000000da7f63	xorl	%esi, %esi
0000000000da7f65	movl	$0x7d, %ecx
0000000000da7f6a	xorl	%eax, %eax
0000000000da7f6c	callq	0x1495d0c                       ## symbol stub for: __PCHandleLogAssertion
0000000000da7f71	movq	0x8(%rbx), %rdi
0000000000da7f75	callq	*0xb4578d(%rip)                 ## literal pool symbol address: _objc_release
0000000000da7f7b	addq	$0x18, %rsp
0000000000da7f7f	popq	%rbx
0000000000da7f80	popq	%rbp
0000000000da7f81	retq
0000000000da7f82	movq	%rax, %rdi
0000000000da7f85	callq	___clang_call_terminate
0000000000da7f8a	nopw	(%rax,%rax)
