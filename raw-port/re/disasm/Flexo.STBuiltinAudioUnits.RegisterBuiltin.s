__ZN19STBuiltinAudioUnits15RegisterBuiltinEPFP29AudioComponentPlugInInterfacePK25AudioComponentDescriptionEj:
0000000001251860	pushq	%rbp
0000000001251861	movq	%rsp, %rbp
0000000001251864	subq	$0x20, %rsp
0000000001251868	movq	%rdi, %rcx
000000000125186b	movl	$0x61756d78, -0x14(%rbp)        ## imm = 0x61756D78
0000000001251872	movl	%esi, -0x10(%rbp)
0000000001251875	movabsq	$0x37461705f, %rax              ## imm = 0x37461705F
000000000125187f	movq	%rax, -0xc(%rbp)
0000000001251883	movl	$0x0, -0x4(%rbp)
000000000125188a	leaq	0x6de357(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000001251891	leaq	-0x14(%rbp), %rdi
0000000001251895	xorl	%edx, %edx
0000000001251897	callq	0x1494512                       ## symbol stub for: _AudioComponentRegister
000000000125189c	testq	%rax, %rax
000000000125189f	setne	%al
00000000012518a2	addq	$0x20, %rsp
00000000012518a6	popq	%rbp
00000000012518a7	retq
00000000012518a8	nopl	(%rax,%rax)
