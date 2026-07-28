__ZN4HGCV32AllowPixelSizeCastingForHGFormatE8HGFormat:
0000000000090f60	pushq	%rbp
0000000000090f61	movq	%rsp, %rbp
0000000000090f64	pushq	%rbx
0000000000090f65	subq	$0x18, %rsp
0000000000090f69	movl	%edi, %ebx
0000000000090f6b	movq	__ZZN4HGCV32AllowPixelSizeCastingForHGFormatE8HGFormatE8envCheck(%rip), %rax ## HGCV::AllowPixelSizeCastingForHGFormat(HGFormat)::envCheck
0000000000090f72	cmpq	$-0x1, %rax
0000000000090f76	je	0x90f9f
0000000000090f78	leaq	-0x9(%rbp), %rax
0000000000090f7c	movq	%rax, -0x20(%rbp)
0000000000090f80	leaq	-0x20(%rbp), %rax
0000000000090f84	movq	%rax, -0x18(%rbp)
0000000000090f88	leaq	__ZZN4HGCV32AllowPixelSizeCastingForHGFormatE8HGFormatE8envCheck(%rip), %rdi ## HGCV::AllowPixelSizeCastingForHGFormat(HGFormat)::envCheck
0000000000090f8f	leaq	__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN4HGCV32AllowPixelSizeCastingForHGFormatE8HGFormatE3$_0EEEEEvPv(%rip), %rdx ## void std::__1::__call_once_proxy[abi:nqe210106]<std::__1::tuple<HGCV::AllowPixelSizeCastingForHGFormat(HGFormat)::$_0&&>>(void*)
0000000000090f96	leaq	-0x18(%rbp), %rsi
0000000000090f9a	callq	0x3c4e26                        ## symbol stub for: __ZNSt3__111__call_onceERVmPvPFvS2_E
0000000000090f9f	leal	-0x19(%rbx), %eax
0000000000090fa2	cmpl	$-0x2, %eax
0000000000090fa5	setb	%cl
0000000000090fa8	cmpl	$0x1b, %ebx
0000000000090fab	setne	%al
0000000000090fae	andb	%cl, %al
0000000000090fb0	orb	__ZZN4HGCV32AllowPixelSizeCastingForHGFormatE8HGFormatE28forcePixelSizeCastingAllowed(%rip), %al ## HGCV::AllowPixelSizeCastingForHGFormat(HGFormat)::forcePixelSizeCastingAllowed
0000000000090fb6	addq	$0x18, %rsp
0000000000090fba	popq	%rbx
0000000000090fbb	popq	%rbp
0000000000090fbc	retq
0000000000090fbd	nopl	(%rax)
