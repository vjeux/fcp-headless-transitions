__ZNK25OZChannelMaterialMapScale5cloneEv:
00000000002834e0	pushq	%rbp
00000000002834e1	movq	%rsp, %rbp
00000000002834e4	pushq	%r14
00000000002834e6	pushq	%rbx
00000000002834e7	movq	%rdi, %r14
00000000002834ea	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000002834ef	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000002834f4	movq	%rax, %rbx
00000000002834f7	movq	%rax, %rdi
00000000002834fa	movq	%r14, %rsi
00000000002834fd	xorl	%edx, %edx
00000000002834ff	callq	__ZN25OZChannelMaterialMapScaleC2ERKS_P15OZChannelFolder ## OZChannelMaterialMapScale::OZChannelMaterialMapScale(OZChannelMaterialMapScale const&, OZChannelFolder*)
0000000000283504	movq	%rbx, %rax
0000000000283507	popq	%rbx
0000000000283508	popq	%r14
000000000028350a	popq	%rbp
000000000028350b	retq
000000000028350c	movq	%rax, %r14
000000000028350f	movq	%rbx, %rdi
0000000000283512	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000283517	movq	%r14, %rdi
000000000028351a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000028351f	nop
