__ZN23OZMaterialCompoundLayer27isAnySharedTransformEnabledEv:
00000000001fa020	pushq	%rbp
00000000001fa021	movq	%rsp, %rbp
00000000001fa024	pushq	%rbx
00000000001fa025	pushq	%rax
00000000001fa026	movq	%rdi, %rbx
00000000001fa029	addq	$0xad8, %rdi                    ## imm = 0xAD8
00000000001fa030	movl	$0x400000, %esi                 ## imm = 0x400000
00000000001fa035	callq	0x6df57c                        ## symbol stub for: __ZNK13OZChannelBase8testFlagEy
00000000001fa03a	testb	%al, %al
00000000001fa03c	je	0x1fa047
00000000001fa03e	xorl	%eax, %eax
00000000001fa040	addq	$0x8, %rsp
00000000001fa044	popq	%rbx
00000000001fa045	popq	%rbp
00000000001fa046	retq
00000000001fa047	addq	$0xb58, %rbx                    ## imm = 0xB58
00000000001fa04e	movq	0x62a4bb(%rip), %rsi            ## literal pool symbol address: _kCMTimeZero
00000000001fa055	xorps	%xmm0, %xmm0
00000000001fa058	movq	%rbx, %rdi
00000000001fa05b	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000001fa060	testl	%eax, %eax
00000000001fa062	setne	%al
00000000001fa065	addq	$0x8, %rsp
00000000001fa069	popq	%rbx
00000000001fa06a	popq	%rbp
00000000001fa06b	retq
00000000001fa06c	nopl	(%rax)
