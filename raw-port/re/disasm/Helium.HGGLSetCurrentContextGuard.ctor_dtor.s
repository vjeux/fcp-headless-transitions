__ZN26HGGLSetCurrentContextGuardC2E14HGGLContextPtr:
00000000001b4050	pushq	%rbp
00000000001b4051	movq	%rsp, %rbp
00000000001b4054	pushq	%r14
00000000001b4056	pushq	%rbx
00000000001b4057	subq	$0x10, %rsp
00000000001b405b	movq	%rsi, %r14
00000000001b405e	movq	%rdi, %rbx
00000000001b4061	callq	__ZN14HGGLContextCGL10getCurrentEv ## HGGLContextCGL::getCurrent()
00000000001b4066	movb	$0x0, 0x8(%rbx)
00000000001b406a	movq	(%r14), %rax
00000000001b406d	cmpq	%rax, (%rbx)
00000000001b4070	je	0x1b4083
00000000001b4072	movq	%rax, -0x18(%rbp)
00000000001b4076	leaq	-0x18(%rbp), %rdi
00000000001b407a	callq	__ZN14HGGLContextCGL10setCurrentE14HGGLContextPtr ## HGGLContextCGL::setCurrent(HGGLContextPtr)
00000000001b407f	movb	$0x1, 0x8(%rbx)
00000000001b4083	addq	$0x10, %rsp
00000000001b4087	popq	%rbx
00000000001b4088	popq	%r14
00000000001b408a	popq	%rbp
00000000001b408b	retq
00000000001b408c	movq	$0x0, (%rbx)
00000000001b4093	movq	%rax, %rdi
00000000001b4096	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001b409b	nopl	(%rax,%rax)
__ZN26HGGLSetCurrentContextGuardC1E14HGGLContextPtr:
00000000001b40a0	pushq	%rbp
00000000001b40a1	movq	%rsp, %rbp
00000000001b40a4	pushq	%r14
00000000001b40a6	pushq	%rbx
00000000001b40a7	subq	$0x10, %rsp
00000000001b40ab	movq	%rsi, %r14
00000000001b40ae	movq	%rdi, %rbx
00000000001b40b1	callq	__ZN14HGGLContextCGL10getCurrentEv ## HGGLContextCGL::getCurrent()
00000000001b40b6	movb	$0x0, 0x8(%rbx)
00000000001b40ba	movq	(%r14), %rax
00000000001b40bd	cmpq	%rax, (%rbx)
00000000001b40c0	je	0x1b40d3
00000000001b40c2	movq	%rax, -0x18(%rbp)
00000000001b40c6	leaq	-0x18(%rbp), %rdi
00000000001b40ca	callq	__ZN14HGGLContextCGL10setCurrentE14HGGLContextPtr ## HGGLContextCGL::setCurrent(HGGLContextPtr)
00000000001b40cf	movb	$0x1, 0x8(%rbx)
00000000001b40d3	addq	$0x10, %rsp
00000000001b40d7	popq	%rbx
00000000001b40d8	popq	%r14
00000000001b40da	popq	%rbp
00000000001b40db	retq
00000000001b40dc	movq	$0x0, (%rbx)
00000000001b40e3	movq	%rax, %rdi
00000000001b40e6	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001b40eb	nopl	(%rax,%rax)
__ZN26HGGLSetCurrentContextGuardD2Ev:
00000000001b40f0	pushq	%rbp
00000000001b40f1	movq	%rsp, %rbp
00000000001b40f4	pushq	%rbx
00000000001b40f5	pushq	%rax
00000000001b40f6	movq	%rdi, %rbx
00000000001b40f9	cmpb	$0x1, 0x8(%rdi)
00000000001b40fd	jne	0x1b410f
00000000001b40ff	movq	(%rbx), %rax
00000000001b4102	movq	%rax, -0x10(%rbp)
00000000001b4106	leaq	-0x10(%rbp), %rdi
00000000001b410a	callq	__ZN14HGGLContextCGL10setCurrentE14HGGLContextPtr ## HGGLContextCGL::setCurrent(HGGLContextPtr)
00000000001b410f	movq	$0x0, (%rbx)
00000000001b4116	addq	$0x8, %rsp
00000000001b411a	popq	%rbx
00000000001b411b	popq	%rbp
00000000001b411c	retq
00000000001b411d	movq	%rax, %rdi
00000000001b4120	callq	___clang_call_terminate
00000000001b4125	nopw	%cs:(%rax,%rax)
__ZN26HGGLSetCurrentContextGuardD1Ev:
00000000001b4130	pushq	%rbp
00000000001b4131	movq	%rsp, %rbp
00000000001b4134	pushq	%rbx
00000000001b4135	pushq	%rax
00000000001b4136	movq	%rdi, %rbx
00000000001b4139	cmpb	$0x1, 0x8(%rdi)
00000000001b413d	jne	0x1b414f
00000000001b413f	movq	(%rbx), %rax
00000000001b4142	movq	%rax, -0x10(%rbp)
00000000001b4146	leaq	-0x10(%rbp), %rdi
00000000001b414a	callq	__ZN14HGGLContextCGL10setCurrentE14HGGLContextPtr ## HGGLContextCGL::setCurrent(HGGLContextPtr)
00000000001b414f	movq	$0x0, (%rbx)
00000000001b4156	addq	$0x8, %rsp
00000000001b415a	popq	%rbx
00000000001b415b	popq	%rbp
00000000001b415c	retq
00000000001b415d	movq	%rax, %rdi
00000000001b4160	callq	___clang_call_terminate
00000000001b4165	addb	%al, (%rax)
