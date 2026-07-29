__ZN17OZSimulationState14GetCommonGroupEP15OZTransformNodeS1_:
00000000001ef310	pushq	%rbp
00000000001ef311	movq	%rsp, %rbp
00000000001ef314	testq	%rdi, %rdi
00000000001ef317	sete	%al
00000000001ef31a	testq	%rsi, %rsi
00000000001ef31d	sete	%cl
00000000001ef320	orb	%al, %cl
00000000001ef322	jne	0x1ef34c
00000000001ef324	movl	$0x1, %edx
00000000001ef329	callq	__ZN11OZSceneNode17getCommonAncestorEPS_b ## OZSceneNode::getCommonAncestor(OZSceneNode*, bool)
00000000001ef32e	testq	%rax, %rax
00000000001ef331	je	0x1ef34c
00000000001ef333	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000001ef33a	leaq	__ZTI15OZTransformNode(%rip), %rdx ## typeinfo for OZTransformNode
00000000001ef341	movq	%rax, %rdi
00000000001ef344	xorl	%ecx, %ecx
00000000001ef346	popq	%rbp
00000000001ef347	jmp	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000001ef34c	xorl	%eax, %eax
00000000001ef34e	popq	%rbp
00000000001ef34f	retq
