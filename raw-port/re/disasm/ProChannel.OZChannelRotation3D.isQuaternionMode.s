__ZN19OZChannelRotation3D16isQuaternionModeEv:
000000000008201a	pushq	%rbp
000000000008201b	movq	%rsp, %rbp
000000000008201e	addq	$0x250, %rdi                    ## imm = 0x250
0000000000082025	movq	0x48494(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
000000000008202c	xorps	%xmm0, %xmm0
000000000008202f	callq	__ZNK9OZChannel13getValueAsIntERK6CMTimed ## OZChannel::getValueAsInt(CMTime const&, double) const
0000000000082034	cmpl	$0x1, %eax
0000000000082037	sete	%al
000000000008203a	popq	%rbp
000000000008203b	retq
