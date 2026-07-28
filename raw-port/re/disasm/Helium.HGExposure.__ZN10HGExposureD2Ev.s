__ZN10HGExposureD2Ev:
00000000001a8f60	pushq	%rbp
00000000001a8f61	movq	%rsp, %rbp
00000000001a8f64	pushq	%rbx
00000000001a8f65	pushq	%rax
00000000001a8f66	leaq	0x87c9db(%rip), %rax
00000000001a8f6d	movq	%rax, (%rdi)
00000000001a8f70	movq	0x1f0(%rdi), %rax
00000000001a8f77	testq	%rax, %rax
00000000001a8f7a	je	0x1a8f8b
00000000001a8f7c	movq	(%rax), %rcx
00000000001a8f7f	movq	%rdi, %rbx
00000000001a8f82	movq	%rax, %rdi
00000000001a8f85	callq	*0x18(%rcx)
00000000001a8f88	movq	%rbx, %rdi
00000000001a8f8b	addq	$0x8, %rsp
00000000001a8f8f	popq	%rbx
00000000001a8f90	popq	%rbp
00000000001a8f91	jmp	__ZN13HGColorMatrixD2Ev         ## HGColorMatrix::~HGColorMatrix()
00000000001a8f96	movq	%rax, %rdi
00000000001a8f99	callq	___clang_call_terminate
00000000001a8f9e	nop
