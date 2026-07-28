__ZN10HGExposureC2Ev:
00000000001a8e40	pushq	%rbp
00000000001a8e41	movq	%rsp, %rbp
00000000001a8e44	pushq	%r14
00000000001a8e46	pushq	%rbx
00000000001a8e47	movq	%rdi, %rbx
00000000001a8e4a	callq	__ZN13HGColorMatrixC2Ev         ## HGColorMatrix::HGColorMatrix()
00000000001a8e4f	leaq	0x87caf2(%rip), %rax
00000000001a8e56	movq	%rax, (%rbx)
00000000001a8e59	movq	$0x0, 0x1f0(%rbx)
00000000001a8e64	movaps	0x200(%rbx), %xmm0
00000000001a8e6b	cmpneqps	0x21edcd(%rip), %xmm0
00000000001a8e73	movmskps	%xmm0, %eax
00000000001a8e76	testl	%eax, %eax
00000000001a8e78	je	0x1a8e88
00000000001a8e7a	movaps	0x21edbf(%rip), %xmm0
00000000001a8e81	movaps	%xmm0, 0x200(%rbx)
00000000001a8e88	xorps	%xmm0, %xmm0
00000000001a8e8b	xorps	%xmm1, %xmm1
00000000001a8e8e	xorps	%xmm2, %xmm2
00000000001a8e91	movq	%rbx, %rdi
00000000001a8e94	callq	__ZN13HGColorMatrix5ScaleEfff   ## HGColorMatrix::Scale(float, float, float)
00000000001a8e99	popq	%rbx
00000000001a8e9a	popq	%r14
00000000001a8e9c	popq	%rbp
00000000001a8e9d	retq
00000000001a8e9e	movq	%rax, %r14
00000000001a8ea1	movq	0x1f0(%rbx), %rdi
00000000001a8ea8	testq	%rdi, %rdi
00000000001a8eab	je	0x1a8eb3
00000000001a8ead	movq	(%rdi), %rax
00000000001a8eb0	callq	*0x18(%rax)
00000000001a8eb3	movq	%rbx, %rdi
00000000001a8eb6	callq	__ZN13HGColorMatrixD2Ev         ## HGColorMatrix::~HGColorMatrix()
00000000001a8ebb	movq	%r14, %rdi
00000000001a8ebe	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001a8ec3	movq	%rax, %rdi
00000000001a8ec6	callq	___clang_call_terminate
00000000001a8ecb	nopl	(%rax,%rax)
