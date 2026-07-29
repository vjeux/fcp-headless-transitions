__ZN17OZSimulationState16TransformToWorldERK6CMTimeP15OZTransformNodeS4_P9PCVector3IdE:
00000000001ef350	pushq	%rbp
00000000001ef351	movq	%rsp, %rbp
00000000001ef354	pushq	%r15
00000000001ef356	pushq	%r14
00000000001ef358	pushq	%r13
00000000001ef35a	pushq	%r12
00000000001ef35c	pushq	%rbx
00000000001ef35d	subq	$0x108, %rsp                    ## imm = 0x108
00000000001ef364	movq	%rdi, %r13
00000000001ef367	movq	0x3b8(%rsi), %rdi
00000000001ef36e	testq	%rdi, %rdi
00000000001ef371	je	0x1ef478
00000000001ef377	movq	%rcx, %rbx
00000000001ef37a	movq	%rdx, %r12
00000000001ef37d	movq	%rsi, %r15
00000000001ef380	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000001ef387	leaq	__ZTI7OZGroup(%rip), %rdx       ## typeinfo for OZGroup
00000000001ef38e	xorl	%ecx, %ecx
00000000001ef390	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000001ef395	testq	%rax, %rax
00000000001ef398	je	0x1ef478
00000000001ef39e	movq	%rax, %r14
00000000001ef3a1	leaq	-0x130(%rbp), %rdi
00000000001ef3a8	callq	__ZN13OZRenderStateC1Ev         ## OZRenderState::OZRenderState()
00000000001ef3ad	movq	0x10(%r13), %rax
00000000001ef3b1	movq	%rax, -0x120(%rbp)
00000000001ef3b8	movups	(%r13), %xmm0
00000000001ef3bd	movaps	%xmm0, -0x130(%rbp)
00000000001ef3c4	movb	$0x1, %r13b
00000000001ef3c7	testq	%r12, %r12
00000000001ef3ca	je	0x1ef41d
00000000001ef3cc	movq	%r12, %rdi
00000000001ef3cf	movq	%r15, %rsi
00000000001ef3d2	movl	$0x1, %edx
00000000001ef3d7	callq	__ZN11OZSceneNode17getCommonAncestorEPS_b ## OZSceneNode::getCommonAncestor(OZSceneNode*, bool)
00000000001ef3dc	testq	%rax, %rax
00000000001ef3df	je	0x1ef41d
00000000001ef3e1	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000001ef3e8	leaq	__ZTI15OZTransformNode(%rip), %rdx ## typeinfo for OZTransformNode
00000000001ef3ef	xorl	%r15d, %r15d
00000000001ef3f2	movq	%rax, %rdi
00000000001ef3f5	xorl	%ecx, %ecx
00000000001ef3f7	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000001ef3fc	testq	%rax, %rax
00000000001ef3ff	je	0x1ef420
00000000001ef401	movq	(%rax), %rcx
00000000001ef404	movq	%rax, %rdi
00000000001ef407	movq	%rax, %r15
00000000001ef40a	callq	*0x548(%rcx)
00000000001ef410	movsd	%xmm0, -0x108(%rbp)
00000000001ef418	xorl	%r13d, %r13d
00000000001ef41b	jmp	0x1ef420
00000000001ef41d	xorl	%r15d, %r15d
00000000001ef420	movq	%r15, -0xf8(%rbp)
00000000001ef427	movq	(%r14), %rax
00000000001ef42a	leaq	-0x130(%rbp), %rdx
00000000001ef431	movq	%r14, %rdi
00000000001ef434	movq	%rbx, %rsi
00000000001ef437	callq	*0x4e8(%rax)
00000000001ef43d	testb	%r13b, %r13b
00000000001ef440	jne	0x1ef478
00000000001ef442	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000001ef44c	movq	%rax, -0x108(%rbp)
00000000001ef453	movq	$0x0, -0xf8(%rbp)
00000000001ef45e	movb	$0x0, -0x68(%rbp)
00000000001ef462	movq	(%r15), %rax
00000000001ef465	leaq	-0x130(%rbp), %rdx
00000000001ef46c	movq	%r15, %rdi
00000000001ef46f	movq	%rbx, %rsi
00000000001ef472	callq	*0x4e8(%rax)
00000000001ef478	addq	$0x108, %rsp                    ## imm = 0x108
00000000001ef47f	popq	%rbx
00000000001ef480	popq	%r12
00000000001ef482	popq	%r13
00000000001ef484	popq	%r14
00000000001ef486	popq	%r15
00000000001ef488	popq	%rbp
00000000001ef489	retq
00000000001ef48a	nopw	(%rax,%rax)
