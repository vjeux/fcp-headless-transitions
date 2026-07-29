__ZN12HGColorGamma27ConcatenateWithUpstreamNodeEP10HGRendererPP6HGNode:
00000000000f7630	pushq	%rbp
00000000000f7631	movq	%rsp, %rbp
00000000000f7634	pushq	%r15
00000000000f7636	pushq	%r14
00000000000f7638	pushq	%r13
00000000000f763a	pushq	%r12
00000000000f763c	pushq	%rbx
00000000000f763d	pushq	%rax
00000000000f763e	movq	%rdi, %r14
00000000000f7641	movq	(%rdx), %rdi
00000000000f7644	testq	%rdi, %rdi
00000000000f7647	je	0xf7763
00000000000f764d	movq	%rdx, %rbx
00000000000f7650	movq	%rsi, %r12
00000000000f7653	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000f765a	leaq	__ZTI12HGColorGamma(%rip), %rdx ## typeinfo for HGColorGamma
00000000000f7661	xorl	%ecx, %ecx
00000000000f7663	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000f7668	testq	%rax, %rax
00000000000f766b	je	0xf7763
00000000000f7671	movq	%rax, %r15
00000000000f7674	movq	%r12, %rdi
00000000000f7677	movq	%r14, %rsi
00000000000f767a	xorl	%edx, %edx
00000000000f767c	xorl	%ecx, %ecx
00000000000f767e	callq	__ZN10HGRenderer11IsMergeableEP6HGNodeib ## HGRenderer::IsMergeable(HGNode*, int, bool)
00000000000f7683	testb	%al, %al
00000000000f7685	je	0xf7763
00000000000f768b	movq	(%r12), %rax
00000000000f768f	movq	%r12, %rdi
00000000000f7692	callq	*0x130(%rax)
00000000000f7698	testb	%al, %al
00000000000f769a	je	0xf7763
00000000000f76a0	movq	0x498(%r15), %r12
00000000000f76a7	testq	%r12, %r12
00000000000f76aa	je	0xf7763
00000000000f76b0	cmpl	$0x0, 0x420(%r14)
00000000000f76b8	jne	0xf7763
00000000000f76be	movl	0x424(%r15), %eax
00000000000f76c5	decl	%eax
00000000000f76c7	cmpl	$0x2, %eax
00000000000f76ca	ja	0xf76d8
00000000000f76cc	movw	$0x0, 0x494(%r14)
00000000000f76d6	jmp	0xf770e
00000000000f76d8	movzbl	0x494(%r14), %eax
00000000000f76e0	cmpb	0x495(%r15), %al
00000000000f76e7	je	0xf76f7
00000000000f76e9	leaq	0x7efa51(%rip), %rdi            ## literal pool for: "HGColorGamma concatenating with upstream node: inconsistent premultiplication states.\n"
00000000000f76f0	xorl	%eax, %eax
00000000000f76f2	callq	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
00000000000f76f7	movzbl	0x494(%r15), %eax
00000000000f76ff	movb	$0x1, 0x2e9(%r14)
00000000000f7707	movb	%al, 0x494(%r14)
00000000000f770e	movl	0x40c(%r15), %r13d
00000000000f7715	movq	%r14, %rdi
00000000000f7718	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f771d	movb	$0x1, 0x2e9(%r14)
00000000000f7725	movl	%r13d, 0x40c(%r14)
00000000000f772c	movl	0x424(%r15), %r15d
00000000000f7733	movq	%r14, %rdi
00000000000f7736	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000f773b	movb	$0x1, 0x2e9(%r14)
00000000000f7743	movl	%r15d, 0x424(%r14)
00000000000f774a	movq	%r14, %rdi
00000000000f774d	callq	__ZN12HGColorGamma20SetYCbCrBiasAndScaleEv ## HGColorGamma::SetYCbCrBiasAndScale()
00000000000f7752	movq	(%r14), %rax
00000000000f7755	movq	%r14, %rdi
00000000000f7758	xorl	%esi, %esi
00000000000f775a	movq	%r12, %rdx
00000000000f775d	callq	*0x78(%rax)
00000000000f7760	movq	%r12, (%rbx)
00000000000f7763	addq	$0x8, %rsp
00000000000f7767	popq	%rbx
00000000000f7768	popq	%r12
00000000000f776a	popq	%r13
00000000000f776c	popq	%r14
00000000000f776e	popq	%r15
00000000000f7770	popq	%rbp
00000000000f7771	retq
00000000000f7772	nopw	%cs:(%rax,%rax)
