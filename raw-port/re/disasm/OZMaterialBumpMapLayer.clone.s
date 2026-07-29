__ZNK22OZMaterialBumpMapLayer5cloneEv:
0000000000440b50	pushq	%rbp
0000000000440b51	movq	%rsp, %rbp
0000000000440b54	pushq	%r14
0000000000440b56	pushq	%rbx
0000000000440b57	movq	%rdi, %r14
0000000000440b5a	movl	$0x2fa8, %edi                   ## imm = 0x2FA8
0000000000440b5f	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000440b64	movq	%rax, %rbx
0000000000440b67	movq	%rax, %rdi
0000000000440b6a	movq	%r14, %rsi
0000000000440b6d	xorl	%edx, %edx
0000000000440b6f	callq	__ZN22OZMaterialBumpMapLayerC2ERKS_P15OZChannelFolder ## OZMaterialBumpMapLayer::OZMaterialBumpMapLayer(OZMaterialBumpMapLayer const&, OZChannelFolder*)
0000000000440b74	movq	%rbx, %rax
0000000000440b77	popq	%rbx
0000000000440b78	popq	%r14
0000000000440b7a	popq	%rbp
0000000000440b7b	retq
0000000000440b7c	movq	%rax, %r14
0000000000440b7f	movq	%rbx, %rdi
0000000000440b82	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000440b87	movq	%r14, %rdi
0000000000440b8a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000440b8f	nop
