__ZN18DummyMaterialLayerC1EPv:
00000000001e1c80	pushq	%rbp
00000000001e1c81	movq	%rsp, %rbp
00000000001e1c84	pushq	%r14
00000000001e1c86	pushq	%rbx
00000000001e1c87	movq	%rsi, %rdx
00000000001e1c8a	movq	%rdi, %rbx
00000000001e1c8d	leaq	0x38(%rdi), %r14
00000000001e1c91	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
00000000001e1c98	addq	$0x10, %rax
00000000001e1c9c	movq	%rax, 0x38(%rdi)
00000000001e1ca0	movq	$0x0, 0x40(%rdi)
00000000001e1ca8	leaq	0x6618c1(%rip), %rsi
00000000001e1caf	callq	0x6ddeea                        ## symbol stub for: __ZN15LiMaterialLayerC2EPv
00000000001e1cb4	leaq	0x66182d(%rip), %rax
00000000001e1cbb	movq	%rax, (%rbx)
00000000001e1cbe	leaq	0x66188b(%rip), %rax
00000000001e1cc5	movq	%rax, 0x38(%rbx)
00000000001e1cc9	xorps	%xmm0, %xmm0
00000000001e1ccc	movups	%xmm0, 0x20(%rbx)
00000000001e1cd0	movq	$0x0, 0x30(%rbx)
00000000001e1cd8	movb	$0x0, 0x19(%rbx)
00000000001e1cdc	popq	%rbx
00000000001e1cdd	popq	%r14
00000000001e1cdf	popq	%rbp
00000000001e1ce0	retq
00000000001e1ce1	movq	%rax, %rbx
00000000001e1ce4	movq	%r14, %rdi
00000000001e1ce7	callq	__ZN13PCShared_baseD2Ev         ## PCShared_base::~PCShared_base()
00000000001e1cec	movq	%rbx, %rdi
00000000001e1cef	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001e1cf4	nopw	%cs:(%rax,%rax)
