__ZN29OZLiSegmentationFeatherFilterC1EP11OZImageMaskRK14OZRenderParams:
0000000000424d20	pushq	%rbp
0000000000424d21	movq	%rsp, %rbp
0000000000424d24	pushq	%r15
0000000000424d26	pushq	%r14
0000000000424d28	pushq	%rbx
0000000000424d29	pushq	%rax
0000000000424d2a	movq	%rdx, %r15
0000000000424d2d	movq	%rsi, %r14
0000000000424d30	movq	%rdi, %rbx
0000000000424d33	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
0000000000424d3a	addq	$0x10, %rax
0000000000424d3e	movq	%rax, 0x5f0(%rdi)
0000000000424d45	movq	$0x0, 0x5f8(%rdi)
0000000000424d50	leaq	0x43cb09(%rip), %rsi
0000000000424d57	callq	0x6dd83c                        ## symbol stub for: __ZN13LiImageSourceC2Ev
0000000000424d5c	leaq	0x43d8a5(%rip), %rax
0000000000424d63	movq	%rax, (%rbx)
0000000000424d66	leaq	0x43d983(%rip), %rax
0000000000424d6d	movq	%rax, 0x5f0(%rbx)
0000000000424d74	movq	$0x0, 0x10(%rbx)
0000000000424d7c	leaq	0x18(%rbx), %rdi
0000000000424d80	callq	0x6ddae8                        ## symbol stub for: __ZN13PCSharedCountC1Ev
0000000000424d85	movl	$0x0, 0x20(%rbx)
0000000000424d8c	leaq	0x43d75d(%rip), %rax
0000000000424d93	movq	%rax, (%rbx)
0000000000424d96	leaq	0x43d83b(%rip), %rax
0000000000424d9d	movq	%rax, 0x5f0(%rbx)
0000000000424da4	movq	%r14, 0x28(%rbx)
0000000000424da8	leaq	0x30(%rbx), %rdi
0000000000424dac	movq	%r15, %rsi
0000000000424daf	callq	__ZN14OZRenderParamsC1ERKS_     ## OZRenderParams::OZRenderParams(OZRenderParams const&)
0000000000424db4	leaq	0x43c98d(%rip), %rax
0000000000424dbb	movq	%rax, (%rbx)
0000000000424dbe	leaq	0x43ca6b(%rip), %rax
0000000000424dc5	movq	%rax, 0x5f0(%rbx)
0000000000424dcc	movq	%r14, 0x28(%rbx)
0000000000424dd0	addq	$0x8, %rsp
0000000000424dd4	popq	%rbx
0000000000424dd5	popq	%r14
0000000000424dd7	popq	%r15
0000000000424dd9	popq	%rbp
0000000000424dda	retq
0000000000424ddb	movq	%rax, %r14
0000000000424dde	leaq	0x43ca73(%rip), %rsi
0000000000424de5	movq	%rbx, %rdi
0000000000424de8	callq	__ZN13LiImageFilterD2Ev         ## LiImageFilter::~LiImageFilter()
0000000000424ded	jmp	0x424e06
0000000000424def	movq	%rax, %r14
0000000000424df2	leaq	0x43ca67(%rip), %rsi
0000000000424df9	movq	%rbx, %rdi
0000000000424dfc	callq	0x6dd842                        ## symbol stub for: __ZN13LiImageSourceD2Ev
0000000000424e01	jmp	0x424e06
0000000000424e03	movq	%rax, %r14
0000000000424e06	addq	$0x5f0, %rbx                    ## imm = 0x5F0
0000000000424e0d	movq	%rbx, %rdi
0000000000424e10	callq	__ZN13PCShared_baseD2Ev         ## PCShared_base::~PCShared_base()
0000000000424e15	movq	%r14, %rdi
0000000000424e18	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000424e1d	nopl	(%rax)
