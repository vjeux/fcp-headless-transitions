__ZN19OZMaterialLayerBase38makeMaterialLayerSequenceChannelFolderEv:
00000000004ac660	pushq	%rbp
00000000004ac661	movq	%rsp, %rbp
00000000004ac664	pushq	%r15
00000000004ac666	pushq	%r14
00000000004ac668	pushq	%rbx
00000000004ac669	subq	$0x18, %rsp
00000000004ac66d	movq	%rdi, %r14
00000000004ac670	movl	$0x80, %edi
00000000004ac675	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000004ac67a	movq	%rax, %rbx
00000000004ac67d	movl	0x18(%r14), %ecx
00000000004ac681	addq	$0x20, %r14
00000000004ac685	movq	%rax, %rdi
00000000004ac688	movq	%r14, %rsi
00000000004ac68b	xorl	%edx, %edx
00000000004ac68d	xorl	%r8d, %r8d
00000000004ac690	xorl	%r9d, %r9d
00000000004ac693	callq	__ZN29OZMaterialLayerSequenceFolderC1ERK8PCStringP15OZChannelFolderjjj ## OZMaterialLayerSequenceFolder::OZMaterialLayerSequenceFolder(PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int)
00000000004ac698	movl	$0x98, %edi
00000000004ac69d	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000004ac6a2	movq	%rax, %r14
00000000004ac6a5	leaq	0x3321e9(%rip), %rsi            ## literal pool for: "No Sequence Channels"
00000000004ac6ac	leaq	-0x20(%rbp), %rdi
00000000004ac6b0	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000004ac6b5	movq	$0x0, (%rsp)
00000000004ac6bd	leaq	-0x20(%rbp), %rsi
00000000004ac6c1	movq	%r14, %rdi
00000000004ac6c4	movq	%rbx, %rdx
00000000004ac6c7	movl	$0x270e, %ecx                   ## imm = 0x270E
00000000004ac6cc	xorl	%r8d, %r8d
00000000004ac6cf	xorl	%r9d, %r9d
00000000004ac6d2	callq	__ZN15OZChannelDoubleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000004ac6d7	leaq	-0x20(%rbp), %rdi
00000000004ac6db	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004ac6e0	movq	(%r14), %rax
00000000004ac6e3	movq	%r14, %rdi
00000000004ac6e6	xorl	%esi, %esi
00000000004ac6e8	xorl	%edx, %edx
00000000004ac6ea	callq	*0x68(%rax)
00000000004ac6ed	movl	$__ZN19OZSceneNode_FactoryD0Ev, %esi ## OZSceneNode_Factory::~OZSceneNode_Factory()
00000000004ac6f2	movq	%r14, %rdi
00000000004ac6f5	xorl	%edx, %edx
00000000004ac6f7	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
00000000004ac6fc	movq	%rbx, %rax
00000000004ac6ff	addq	$0x18, %rsp
00000000004ac703	popq	%rbx
00000000004ac704	popq	%r14
00000000004ac706	popq	%r15
00000000004ac708	popq	%rbp
00000000004ac709	retq
00000000004ac70a	movq	%rax, %r15
00000000004ac70d	leaq	-0x20(%rbp), %rdi
00000000004ac711	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004ac716	jmp	0x4ac71b
00000000004ac718	movq	%rax, %r15
00000000004ac71b	movq	%r14, %rdi
00000000004ac71e	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004ac723	movq	%r15, %rdi
00000000004ac726	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004ac72b	movq	%rax, %r15
00000000004ac72e	movq	%rbx, %rdi
00000000004ac731	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004ac736	movq	%r15, %rdi
00000000004ac739	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004ac73e	nop
