__ZN20FFOZActiveToolFolder6assignEPK13OZChannelBase:
0000000000217700	pushq	%rbp
0000000000217701	movq	%rsp, %rbp
0000000000217704	pushq	%r14
0000000000217706	pushq	%rbx
0000000000217707	movq	%rsi, %r14
000000000021770a	movq	%rdi, %rbx
000000000021770d	callq	__ZN23FFOZRiggedChannelFolder6assignEPK13OZChannelBase ## FFOZRiggedChannelFolder::assign(OZChannelBase const*)
0000000000217712	testq	%r14, %r14
0000000000217715	je	0x217750
0000000000217717	movq	0x16d2472(%rip), %rsi           ## literal pool symbol address: __ZTI13OZChannelBase
000000000021771e	leaq	__ZTI20FFOZActiveToolFolder(%rip), %rdx ## typeinfo for FFOZActiveToolFolder
0000000000217725	movq	%r14, %rdi
0000000000217728	xorl	%ecx, %ecx
000000000021772a	callq	0x14974b8                       ## symbol stub for: ___dynamic_cast
000000000021772f	testq	%rax, %rax
0000000000217732	je	0x217750
0000000000217734	addq	$0x88, %rax
000000000021773a	addq	$0x88, %rbx
0000000000217741	movq	%rbx, %rdi
0000000000217744	movq	%rax, %rsi
0000000000217747	popq	%rbx
0000000000217748	popq	%r14
000000000021774a	popq	%rbp
000000000021774b	jmp	0x1496db0                       ## symbol stub for: __ZN8PCString3setERKS_
0000000000217750	popq	%rbx
0000000000217751	popq	%r14
0000000000217753	popq	%rbp
0000000000217754	retq
0000000000217755	nopw	%cs:(%rax,%rax)
