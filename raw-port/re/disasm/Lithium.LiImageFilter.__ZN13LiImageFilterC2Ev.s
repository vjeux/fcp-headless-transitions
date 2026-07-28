__ZN13LiImageFilterC2Ev:
000000000004d5a0	pushq	%rbp
000000000004d5a1	movq	%rsp, %rbp
000000000004d5a4	pushq	%r15
000000000004d5a6	pushq	%r14
000000000004d5a8	pushq	%rbx
000000000004d5a9	pushq	%rax
000000000004d5aa	movq	%rsi, %r15
000000000004d5ad	movq	%rdi, %rbx
000000000004d5b0	leaq	0x8(%rsi), %r14
000000000004d5b4	movq	%r14, %rsi
000000000004d5b7	callq	__ZN13LiImageSourceC2Ev         ## LiImageSource::LiImageSource()
000000000004d5bc	movq	(%r15), %rax
000000000004d5bf	movq	%rax, (%rbx)
000000000004d5c2	movq	0x28(%r15), %rcx
000000000004d5c6	movq	-0x18(%rax), %rax
000000000004d5ca	movq	%rcx, (%rbx,%rax)
000000000004d5ce	movq	$0x0, 0x10(%rbx)
000000000004d5d6	leaq	0x18(%rbx), %rdi
000000000004d5da	callq	0x1c433c                        ## symbol stub for: __ZN13PCSharedCountC1Ev
000000000004d5df	movl	$0x0, 0x20(%rbx)
000000000004d5e6	addq	$0x8, %rsp
000000000004d5ea	popq	%rbx
000000000004d5eb	popq	%r14
000000000004d5ed	popq	%r15
000000000004d5ef	popq	%rbp
000000000004d5f0	retq
000000000004d5f1	movq	%rax, %r15
000000000004d5f4	movq	%rbx, %rdi
000000000004d5f7	movq	%r14, %rsi
000000000004d5fa	callq	__ZN13LiImageSourceD2Ev         ## LiImageSource::~LiImageSource()
000000000004d5ff	movq	%r15, %rdi
000000000004d602	callq	0x1c40c6                        ## symbol stub for: __Unwind_Resume
000000000004d607	nop
