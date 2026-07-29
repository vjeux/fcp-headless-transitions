__ZN14HGMetalHandler17EnableDepthBufferEv:
000000000015dca0	pushq	%rbp
000000000015dca1	movq	%rsp, %rbp
000000000015dca4	pushq	%r15
000000000015dca6	pushq	%r14
000000000015dca8	pushq	%r12
000000000015dcaa	pushq	%rbx
000000000015dcab	subq	$0x10, %rsp
000000000015dcaf	cmpq	$0x0, 0x1d0(%rdi)
000000000015dcb7	jne	0x15dd5b
000000000015dcbd	movq	%rdi, %rbx
000000000015dcc0	movq	0xf8(%rdi), %rax
000000000015dcc7	movl	0x40(%rax), %esi
000000000015dcca	movq	0x48(%rax), %rdx
000000000015dcce	movq	0x58(%rax), %rcx
000000000015dcd2	callq	__ZN14HGMetalHandler22FinalizeCommandEncoderEjmm ## HGMetalHandler::FinalizeCommandEncoder(unsigned int, unsigned long, unsigned long)
000000000015dcd7	movq	0x90(%rbx), %rdi
000000000015dcde	callq	__ZN13HGGPURenderer15GetMetalContextEv ## HGGPURenderer::GetMetalContext()
000000000015dce3	movq	0x190(%rbx), %rcx
000000000015dcea	movq	0x14(%rcx), %r14
000000000015dcee	movq	0x1c(%rcx), %r15
000000000015dcf2	movq	0x10(%rax), %rcx
000000000015dcf6	movq	0x10(%rcx), %r12
000000000015dcfa	movq	%rax, %rdi
000000000015dcfd	callq	__ZNK14HGMetalContext11texturePoolEv ## HGMetalContext::texturePool() const
000000000015dd02	movl	0x1e0(%rbx), %r9d
000000000015dd09	leaq	-0x28(%rbp), %rdi
000000000015dd0d	movq	%r12, %rsi
000000000015dd10	movq	%rax, %rdx
000000000015dd13	movq	%r14, %rcx
000000000015dd16	movq	%r15, %r8
000000000015dd19	callq	__ZN14HGMetalTexture11createDepthE15HGMTLDeviceTypeP18HGMetalTexturePool6HGRectj ## HGMetalTexture::createDepth(HGMTLDeviceType, HGMetalTexturePool*, HGRect, unsigned int)
000000000015dd1e	movq	0x1d0(%rbx), %rax
000000000015dd25	movq	-0x28(%rbp), %rdi
000000000015dd29	cmpq	%rdi, %rax
000000000015dd2c	je	0x15dd49
000000000015dd2e	testq	%rax, %rax
000000000015dd31	je	0x15dd40
000000000015dd33	movq	(%rax), %rcx
000000000015dd36	movq	%rax, %rdi
000000000015dd39	callq	*0x18(%rcx)
000000000015dd3c	movq	-0x28(%rbp), %rdi
000000000015dd40	movq	%rdi, 0x1d0(%rbx)
000000000015dd47	jmp	0x15dd54
000000000015dd49	testq	%rax, %rax
000000000015dd4c	je	0x15dd54
000000000015dd4e	movq	(%rdi), %rax
000000000015dd51	callq	*0x18(%rax)
000000000015dd54	movb	$0x1, 0x708(%rbx)
000000000015dd5b	addq	$0x10, %rsp
000000000015dd5f	popq	%rbx
000000000015dd60	popq	%r12
000000000015dd62	popq	%r14
000000000015dd64	popq	%r15
000000000015dd66	popq	%rbp
000000000015dd67	retq
000000000015dd68	movq	%rax, %rdi
000000000015dd6b	callq	___clang_call_terminate
000000000015dd70	movq	%rax, %rbx
000000000015dd73	movq	-0x28(%rbp), %rdi
000000000015dd77	testq	%rdi, %rdi
000000000015dd7a	je	0x15dd82
000000000015dd7c	movq	(%rdi), %rax
000000000015dd7f	callq	*0x18(%rax)
000000000015dd82	movq	%rbx, %rdi
000000000015dd85	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000015dd8a	movq	%rax, %rdi
000000000015dd8d	callq	___clang_call_terminate
000000000015dd92	nopw	%cs:(%rax,%rax)
