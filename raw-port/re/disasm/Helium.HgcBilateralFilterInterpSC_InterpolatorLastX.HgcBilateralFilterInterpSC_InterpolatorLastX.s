__ZN44HgcBilateralFilterInterpSC_InterpolatorLastXC1Ev:
000000000031ce50	pushq	%rbp
000000000031ce51	movq	%rsp, %rbp
000000000031ce54	pushq	%r14
000000000031ce56	pushq	%rbx
000000000031ce57	movq	%rdi, %rbx
000000000031ce5a	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000031ce5f	leaq	0x72625a(%rip), %rax
000000000031ce66	movq	%rax, (%rbx)
000000000031ce69	movl	$0xa7, %edi
000000000031ce6e	callq	0x3c4fac                        ## symbol stub for: __Znam
000000000031ce73	leaq	0x8(%rax), %rcx
000000000031ce77	negl	%ecx
000000000031ce79	andl	$0x1f, %ecx
000000000031ce7c	leaq	(%rcx,%rax), %rdx
000000000031ce80	addq	$0x8, %rdx
000000000031ce84	movq	%rax, (%rcx,%rax)
000000000031ce88	xorps	%xmm0, %xmm0
000000000031ce8b	movaps	%xmm0, 0x8(%rcx,%rax)
000000000031ce90	movaps	%xmm0, 0x18(%rcx,%rax)
000000000031ce95	movss	0xaae23(%rip), %xmm0
000000000031ce9d	movaps	%xmm0, 0x38(%rcx,%rax)
000000000031cea2	movaps	%xmm0, 0x28(%rcx,%rax)
000000000031cea7	movaps	0xae202(%rip), %xmm0
000000000031ceae	movaps	%xmm0, 0x58(%rcx,%rax)
000000000031ceb3	movaps	%xmm0, 0x48(%rcx,%rax)
000000000031ceb8	movaps	0x543011(%rip), %xmm0
000000000031cebf	movaps	%xmm0, 0x78(%rcx,%rax)
000000000031cec4	movaps	%xmm0, 0x68(%rcx,%rax)
000000000031cec9	movq	%rdx, 0x198(%rbx)
000000000031ced0	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
000000000031ced5	andl	0x10(%rbx), %eax
000000000031ced8	orl	$0x400, %eax                    ## imm = 0x400
000000000031cedd	movl	%eax, 0x10(%rbx)
000000000031cee0	popq	%rbx
000000000031cee1	popq	%r14
000000000031cee3	popq	%rbp
000000000031cee4	retq
000000000031cee5	movq	%rax, %r14
000000000031cee8	movq	%rbx, %rdi
000000000031ceeb	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000031cef0	movq	%r14, %rdi
000000000031cef3	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000031cef8	nopl	(%rax,%rax)
