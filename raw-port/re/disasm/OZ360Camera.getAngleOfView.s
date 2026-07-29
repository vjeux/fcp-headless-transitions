__ZNK11OZ360Camera14getAngleOfViewEv:
0000000000448af0	pushq	%rbp
0000000000448af1	movq	%rsp, %rbp
0000000000448af4	pushq	%rbx
0000000000448af5	subq	$0x38, %rsp
0000000000448af9	movq	%rdi, %rbx
0000000000448afc	movq	0x208(%rdi), %rsi
0000000000448b03	leaq	-0x20(%rbp), %rdi
0000000000448b07	callq	__ZNK7OZScene14getCurrentTimeEv ## OZScene::getCurrentTime() const
0000000000448b0c	movq	-0x10(%rbp), %rax
0000000000448b10	movq	%rax, -0x30(%rbp)
0000000000448b14	movups	-0x20(%rbp), %xmm0
0000000000448b18	movaps	%xmm0, -0x40(%rbp)
0000000000448b1c	movq	0x208(%rbx), %rdi
0000000000448b23	leaq	-0x40(%rbp), %rsi
0000000000448b27	callq	__ZN7OZScene15getActiveCameraERK6CMTime ## OZScene::getActiveCamera(CMTime const&)
0000000000448b2c	movq	0x208(%rbx), %rdi
0000000000448b33	movl	%eax, %esi
0000000000448b35	callq	__ZN7OZScene7getNodeEj          ## OZScene::getNode(unsigned int)
0000000000448b3a	testq	%rax, %rax
0000000000448b3d	je	0x448b78
0000000000448b3f	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
0000000000448b46	leaq	__ZTI8OZCamera(%rip), %rdx      ## typeinfo for OZCamera
0000000000448b4d	movq	%rax, %rdi
0000000000448b50	xorl	%ecx, %ecx
0000000000448b52	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000448b57	testq	%rax, %rax
0000000000448b5a	je	0x448b78
0000000000448b5c	addq	$0x1a90, %rax                   ## imm = 0x1A90
0000000000448b62	leaq	-0x20(%rbp), %rsi
0000000000448b66	xorps	%xmm0, %xmm0
0000000000448b69	movq	%rax, %rdi
0000000000448b6c	callq	0x6dfa9e                        ## symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000448b71	addq	$0x38, %rsp
0000000000448b75	popq	%rbx
0000000000448b76	popq	%rbp
0000000000448b77	retq
0000000000448b78	movsd	0x2be390(%rip), %xmm0
0000000000448b80	addq	$0x38, %rsp
0000000000448b84	popq	%rbx
0000000000448b85	popq	%rbp
0000000000448b86	retq
0000000000448b87	nopw	(%rax,%rax)
