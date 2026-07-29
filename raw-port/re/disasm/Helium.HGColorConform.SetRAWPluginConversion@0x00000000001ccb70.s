__ZN14HGColorConform22SetRAWPluginConversionENS_30hgColorConformConversionPresetENSt3__110shared_ptrI17HGRAWRendererBaseEENS_30hgColorConformRAWToLogEncodingE:
00000000001ccb70	pushq	%rbp
00000000001ccb71	movq	%rsp, %rbp
00000000001ccb74	pushq	%r15
00000000001ccb76	pushq	%r14
00000000001ccb78	pushq	%r13
00000000001ccb7a	pushq	%r12
00000000001ccb7c	pushq	%rbx
00000000001ccb7d	pushq	%rax
00000000001ccb7e	movl	%ecx, %r15d
00000000001ccb81	movl	%esi, %r13d
00000000001ccb84	movq	%rdi, %rbx
00000000001ccb87	cmpq	$0x0, (%rdx)
00000000001ccb8b	setne	%al
00000000001ccb8e	leal	-0x17(%r13), %ecx
00000000001ccb92	cmpl	$0x2, %ecx
00000000001ccb95	setb	%r14b
00000000001ccb99	andb	%al, %r14b
00000000001ccb9c	je	0x1ccc0d
00000000001ccb9e	movq	%rdx, %r12
00000000001ccba1	movq	%rbx, %rdi
00000000001ccba4	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001ccba9	movl	%r13d, 0x1e4(%rbx)
00000000001ccbb0	movq	%rbx, %rdi
00000000001ccbb3	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001ccbb8	movq	0x8(%r12), %rax
00000000001ccbbd	movups	(%r12), %xmm0
00000000001ccbc2	testq	%rax, %rax
00000000001ccbc5	je	0x1ccbcc
00000000001ccbc7	lock
00000000001ccbc8	incq	0x8(%rax)
00000000001ccbcc	movq	0x360(%rbx), %r12
00000000001ccbd3	movups	%xmm0, 0x358(%rbx)
00000000001ccbda	testq	%r12, %r12
00000000001ccbdd	je	0x1ccc04
00000000001ccbdf	movq	$-0x1, %rax
00000000001ccbe6	lock
00000000001ccbe7	xaddq	%rax, 0x8(%r12)
00000000001ccbed	testq	%rax, %rax
00000000001ccbf0	jne	0x1ccc04
00000000001ccbf2	movq	(%r12), %rax
00000000001ccbf6	movq	%r12, %rdi
00000000001ccbf9	callq	*0x10(%rax)
00000000001ccbfc	movq	%r12, %rdi
00000000001ccbff	callq	0x3c4efe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
00000000001ccc04	movl	%r15d, 0x318(%rbx)
00000000001ccc0b	jmp	0x1ccc30
00000000001ccc0d	cmpl	$0x0, 0x1e4(%rbx)
00000000001ccc14	je	0x1ccc30
00000000001ccc16	movq	%rbx, %rdi
00000000001ccc19	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001ccc1e	movl	$0x0, 0x1e4(%rbx)
00000000001ccc28	movq	%rbx, %rdi
00000000001ccc2b	callq	__ZN14HGColorConform21ClearConversionParamsEv ## HGColorConform::ClearConversionParams()
00000000001ccc30	movl	%r14d, %eax
00000000001ccc33	addq	$0x8, %rsp
00000000001ccc37	popq	%rbx
00000000001ccc38	popq	%r12
00000000001ccc3a	popq	%r13
00000000001ccc3c	popq	%r14
00000000001ccc3e	popq	%r15
00000000001ccc40	popq	%rbp
00000000001ccc41	retq
00000000001ccc42	nopw	%cs:(%rax,%rax)
