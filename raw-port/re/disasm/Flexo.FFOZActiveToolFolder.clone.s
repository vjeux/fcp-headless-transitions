__ZNK20FFOZActiveToolFolder5cloneEv:
00000000002175f0	pushq	%rbp
00000000002175f1	movq	%rsp, %rbp
00000000002175f4	pushq	%r15
00000000002175f6	pushq	%r14
00000000002175f8	pushq	%rbx
00000000002175f9	pushq	%rax
00000000002175fa	movq	%rdi, %r15
00000000002175fd	movl	$0x90, %edi
0000000000217602	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000217607	movq	%rax, %r14
000000000021760a	movq	%rax, %rbx
000000000021760d	movq	%rax, %rdi
0000000000217610	movq	%r15, %rsi
0000000000217613	xorl	%edx, %edx
0000000000217615	callq	__ZN23FFOZRiggedChannelFolderC1ERKS_P15OZChannelFolder ## FFOZRiggedChannelFolder::FFOZRiggedChannelFolder(FFOZRiggedChannelFolder const&, OZChannelFolder*)
000000000021761a	leaq	0x16dcb2f(%rip), %rax
0000000000217621	movq	%rax, (%rbx)
0000000000217624	leaq	0x16dcdfd(%rip), %rax
000000000021762b	movq	%rax, 0x10(%rbx)
000000000021762f	addq	$0x88, %r14
0000000000217636	movq	%r14, %rdi
0000000000217639	callq	0x1496dda                       ## symbol stub for: __ZN8PCStringC1Ev
000000000021763e	addq	$0x88, %r15
0000000000217645	movq	%r14, %rdi
0000000000217648	movq	%r15, %rsi
000000000021764b	callq	0x1496db0                       ## symbol stub for: __ZN8PCString3setERKS_
0000000000217650	movq	%rbx, %rax
0000000000217653	addq	$0x8, %rsp
0000000000217657	popq	%rbx
0000000000217658	popq	%r14
000000000021765a	popq	%r15
000000000021765c	popq	%rbp
000000000021765d	retq
000000000021765e	movq	%rax, %r15
0000000000217661	movq	%r14, %rdi
0000000000217664	callq	0x1496de0                       ## symbol stub for: __ZN8PCStringD1Ev
0000000000217669	jmp	0x21766e
000000000021766b	movq	%rax, %r15
000000000021766e	movq	%rbx, %rdi
0000000000217671	callq	0x149655e                       ## symbol stub for: __ZN15OZChannelFolderD2Ev
0000000000217676	movq	%rbx, %rdi
0000000000217679	callq	0x1497404                       ## symbol stub for: __ZdlPv
000000000021767e	movq	%r15, %rdi
0000000000217681	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000217686	movq	%rax, %r15
0000000000217689	movq	%rbx, %rdi
000000000021768c	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000217691	movq	%r15, %rdi
0000000000217694	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000217699	nopl	(%rax)
