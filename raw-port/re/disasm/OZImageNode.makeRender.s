__ZN11OZImageNode10makeRenderER14OZRenderParamsRK18OZRenderGraphStateb:
00000000001a3d90	pushq	%rbp
00000000001a3d91	movq	%rsp, %rbp
00000000001a3d94	pushq	%r15
00000000001a3d96	pushq	%r14
00000000001a3d98	pushq	%r12
00000000001a3d9a	pushq	%rbx
00000000001a3d9b	movq	%rdx, %r15
00000000001a3d9e	movq	%rsi, %r12
00000000001a3da1	movq	%rdi, %rbx
00000000001a3da4	movl	$0x5f0, %edi                    ## imm = 0x5F0
00000000001a3da9	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000001a3dae	movq	%rax, %r14
00000000001a3db1	movq	%rax, %rdi
00000000001a3db4	movq	%r12, %rsi
00000000001a3db7	movq	%r15, %rdx
00000000001a3dba	callq	__ZN17OZImageNodeRenderC1EP11OZImageNodeRK14OZRenderParams ## OZImageNodeRender::OZImageNodeRender(OZImageNode*, OZRenderParams const&)
00000000001a3dbf	movq	(%r14), %rax
00000000001a3dc2	movq	-0x18(%rax), %rcx
00000000001a3dc6	addq	%r14, %rcx
00000000001a3dc9	movq	%rcx, (%rbx)
00000000001a3dcc	movq	-0x20(%rax), %rsi
00000000001a3dd0	addq	%r14, %rsi
00000000001a3dd3	movq	%rbx, %rdi
00000000001a3dd6	addq	$0x8, %rdi
00000000001a3dda	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001a3ddf	movq	%rbx, %rax
00000000001a3de2	popq	%rbx
00000000001a3de3	popq	%r12
00000000001a3de5	popq	%r14
00000000001a3de7	popq	%r15
00000000001a3de9	popq	%rbp
00000000001a3dea	retq
00000000001a3deb	movq	%rax, %rbx
00000000001a3dee	movq	%r14, %rdi
00000000001a3df1	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000001a3df6	movq	%rbx, %rdi
00000000001a3df9	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001a3dfe	nop
