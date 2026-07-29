__ZN30OZ3DEnginePhysicsFieldBehavior18isRebuildUIChannelEP13OZChannelBase:
00000000004f0e00	pushq	%rbp
00000000004f0e01	movq	%rsp, %rbp
00000000004f0e04	leaq	0x210(%rdi), %rax
00000000004f0e0b	cmpq	%rax, %rsi
00000000004f0e0e	sete	%cl
00000000004f0e11	addq	$0x440, %rdi                    ## imm = 0x440
00000000004f0e18	cmpq	%rdi, %rsi
00000000004f0e1b	sete	%al
00000000004f0e1e	orb	%cl, %al
00000000004f0e20	popq	%rbp
00000000004f0e21	retq
00000000004f0e22	nopw	%cs:(%rax,%rax)
