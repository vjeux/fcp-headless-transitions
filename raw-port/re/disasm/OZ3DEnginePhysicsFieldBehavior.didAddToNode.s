__ZN30OZ3DEnginePhysicsFieldBehavior12didAddToNodeEP11OZSceneNode:
00000000004f0be0	testq	%rsi, %rsi
00000000004f0be3	je	0x4f0c1a
00000000004f0be5	pushq	%rbp
00000000004f0be6	movq	%rsp, %rbp
00000000004f0be9	pushq	%r14
00000000004f0beb	pushq	%rbx
00000000004f0bec	movq	%rsi, %rbx
00000000004f0bef	movq	%rdi, %r14
00000000004f0bf2	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000004f0bf9	leaq	__ZTI22OZ3DEngineSceneElement(%rip), %rdx ## typeinfo for OZ3DEngineSceneElement
00000000004f0c00	movq	%rbx, %rdi
00000000004f0c03	xorl	%ecx, %ecx
00000000004f0c05	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000004f0c0a	testq	%rax, %rax
00000000004f0c0d	je	0x4f0c16
00000000004f0c0f	movq	%rbx, 0x140(%r14)
00000000004f0c16	popq	%rbx
00000000004f0c17	popq	%r14
00000000004f0c19	popq	%rbp
00000000004f0c1a	retq
00000000004f0c1b	nopl	(%rax,%rax)
