__ZN17OZARAnchorElementC2EP9OZFactoryRK8PCStringj:
000000000062c720	pushq	%rbp
000000000062c721	movq	%rsp, %rbp
000000000062c724	pushq	%rbx
000000000062c725	pushq	%rax
000000000062c726	movq	%rdi, %rbx
000000000062c729	callq	__ZN22OZ3DEngineSceneElementC2EP9OZFactoryRK8PCStringj ## OZ3DEngineSceneElement::OZ3DEngineSceneElement(OZFactory*, PCString const&, unsigned int)
000000000062c72e	leaq	0x259f2b(%rip), %rax
000000000062c735	movq	%rax, (%rbx)
000000000062c738	leaq	0x25a841(%rip), %rax
000000000062c73f	movq	%rax, 0x10(%rbx)
000000000062c743	leaq	0x25aa8e(%rip), %rax
000000000062c74a	movq	%rax, 0x28(%rbx)
000000000062c74e	leaq	0x25aadb(%rip), %rax
000000000062c755	movq	%rax, 0x1978(%rbx)
000000000062c75c	xorps	%xmm0, %xmm0
000000000062c75f	movups	%xmm0, 0x56c0(%rbx)
000000000062c766	addq	$0x8, %rsp
000000000062c76a	popq	%rbx
000000000062c76b	popq	%rbp
000000000062c76c	retq
000000000062c76d	nopl	(%rax)
