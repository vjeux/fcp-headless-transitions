__ZN10HGExposureC1Ev:
00000000001a8ed0	pushq	%rbp
00000000001a8ed1	movq	%rsp, %rbp
00000000001a8ed4	pushq	%r14
00000000001a8ed6	pushq	%rbx
00000000001a8ed7	movq	%rdi, %rbx
00000000001a8eda	callq	__ZN13HGColorMatrixC2Ev         ## HGColorMatrix::HGColorMatrix()
00000000001a8edf	leaq	0x87ca62(%rip), %rax
00000000001a8ee6	movq	%rax, (%rbx)
00000000001a8ee9	movq	$0x0, 0x1f0(%rbx)
00000000001a8ef4	movaps	0x200(%rbx), %xmm0
00000000001a8efb	cmpneqps	0x21ed3d(%rip), %xmm0
00000000001a8f03	movmskps	%xmm0, %eax
00000000001a8f06	testl	%eax, %eax
00000000001a8f08	je	0x1a8f18
00000000001a8f0a	movaps	0x21ed2f(%rip), %xmm0
00000000001a8f11	movaps	%xmm0, 0x200(%rbx)
00000000001a8f18	xorps	%xmm0, %xmm0
00000000001a8f1b	xorps	%xmm1, %xmm1
00000000001a8f1e	xorps	%xmm2, %xmm2
00000000001a8f21	movq	%rbx, %rdi
00000000001a8f24	callq	__ZN13HGColorMatrix5ScaleEfff   ## HGColorMatrix::Scale(float, float, float)
00000000001a8f29	popq	%rbx
00000000001a8f2a	popq	%r14
00000000001a8f2c	popq	%rbp
00000000001a8f2d	retq
00000000001a8f2e	movq	%rax, %r14
00000000001a8f31	movq	0x1f0(%rbx), %rdi
00000000001a8f38	testq	%rdi, %rdi
00000000001a8f3b	je	0x1a8f43
00000000001a8f3d	movq	(%rdi), %rax
00000000001a8f40	callq	*0x18(%rax)
00000000001a8f43	movq	%rbx, %rdi
00000000001a8f46	callq	__ZN13HGColorMatrixD2Ev         ## HGColorMatrix::~HGColorMatrix()
00000000001a8f4b	movq	%r14, %rdi
00000000001a8f4e	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001a8f53	movq	%rax, %rdi
00000000001a8f56	callq	___clang_call_terminate
00000000001a8f5b	nopl	(%rax,%rax)
