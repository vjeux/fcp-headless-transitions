__ZN22OZMaterialBumpMapLayer38makeMaterialLayerSequenceChannelFolderEv:
0000000000440bb0	pushq	%rbp
0000000000440bb1	movq	%rsp, %rbp
0000000000440bb4	pushq	%r14
0000000000440bb6	pushq	%rbx
0000000000440bb7	movq	%rdi, %r14
0000000000440bba	movl	$0x8e8, %edi                    ## imm = 0x8E8
0000000000440bbf	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000440bc4	movq	%rax, %rbx
0000000000440bc7	movl	0x18(%r14), %ecx
0000000000440bcb	addq	$0x20, %r14
0000000000440bcf	movq	%rax, %rdi
0000000000440bd2	movq	%r14, %rsi
0000000000440bd5	xorl	%edx, %edx
0000000000440bd7	xorl	%r8d, %r8d
0000000000440bda	xorl	%r9d, %r9d
0000000000440bdd	callq	__ZN36OZMaterialBumpMapLayerSequenceFolderC1ERK8PCStringP15OZChannelFolderjjj ## OZMaterialBumpMapLayerSequenceFolder::OZMaterialBumpMapLayerSequenceFolder(PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int)
0000000000440be2	movq	%rbx, %rax
0000000000440be5	popq	%rbx
0000000000440be6	popq	%r14
0000000000440be8	popq	%rbp
0000000000440be9	retq
0000000000440bea	movq	%rax, %r14
0000000000440bed	movq	%rbx, %rdi
0000000000440bf0	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000440bf5	movq	%r14, %rdi
0000000000440bf8	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000440bfd	nopl	(%rax)
