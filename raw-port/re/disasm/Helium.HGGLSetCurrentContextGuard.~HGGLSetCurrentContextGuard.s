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
00000000001b4167	addb	%al, (%rax)
00000000001b4169	addb	%al, (%rax)
00000000001b416b	addb	%al, (%rax)
00000000001b416d	addb	%al, (%rax)
00000000001b416f	addb	%dl, 0x48(%rbp)
00000000001b4172	movl	%esp, %ebp
00000000001b4174	pushq	%rbx
00000000001b4175	pushq	%rax
00000000001b4176	movq	%rdi, %rbx
00000000001b4179	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
00000000001b417e	leaq	0x873013(%rip), %rax
00000000001b4185	movq	%rax, (%rbx)
00000000001b4188	xorps	%xmm0, %xmm0
00000000001b418b	movups	%xmm0, 0x38(%rbx)
00000000001b418f	movups	%xmm0, 0x58(%rbx)
00000000001b4193	movups	%xmm0, 0x18(%rbx)
00000000001b4197	movups	%xmm0, 0x28(%rbx)
00000000001b419b	movups	%xmm0, 0x48(%rbx)
00000000001b419f	movups	%xmm0, 0x68(%rbx)
00000000001b41a3	movups	%xmm0, 0x78(%rbx)
00000000001b41a7	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000001b41b1	movq	%rax, 0x10(%rbx)
00000000001b41b5	movq	%rax, 0x38(%rbx)
00000000001b41b9	movq	%rax, 0x60(%rbx)
00000000001b41bd	movq	%rax, 0x88(%rbx)
00000000001b41c4	addq	$0x8, %rsp
00000000001b41c8	popq	%rbx
00000000001b41c9	popq	%rbp
00000000001b41ca	retq
00000000001b41cb	nopl	(%rax,%rax)
