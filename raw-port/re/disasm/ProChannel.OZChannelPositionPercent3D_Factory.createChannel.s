__ZN34OZChannelPositionPercent3D_Factory13createChannelERK8PCStringj:
00000000000a6ac4	pushq	%rbp
00000000000a6ac5	movq	%rsp, %rbp
00000000000a6ac8	pushq	%r15
00000000000a6aca	pushq	%r14
00000000000a6acc	pushq	%r12
00000000000a6ace	pushq	%rbx
00000000000a6acf	movl	%edx, %r14d
00000000000a6ad2	movq	%rsi, %r15
00000000000a6ad5	movq	%rdi, %r12
00000000000a6ad8	movl	$0x378, %edi                    ## imm = 0x378
00000000000a6add	callq	0xace4c                         ## symbol stub for: __Znwm
00000000000a6ae2	movq	%rax, %rbx
00000000000a6ae5	movq	%rax, %rdi
00000000000a6ae8	movq	%r12, %rsi
00000000000a6aeb	movq	%r15, %rdx
00000000000a6aee	movl	%r14d, %ecx
00000000000a6af1	callq	__ZN26OZChannelPositionPercent3DC2EP9OZFactoryRK8PCStringj ## OZChannelPositionPercent3D::OZChannelPositionPercent3D(OZFactory*, PCString const&, unsigned int)
00000000000a6af6	movq	%rbx, %rax
00000000000a6af9	popq	%rbx
00000000000a6afa	popq	%r12
00000000000a6afc	popq	%r14
00000000000a6afe	popq	%r15
00000000000a6b00	popq	%rbp
00000000000a6b01	retq
00000000000a6b02	movq	%rax, %r14
00000000000a6b05	movq	%rbx, %rdi
00000000000a6b08	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000a6b0d	movq	%r14, %rdi
00000000000a6b10	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000a6b15	nop
