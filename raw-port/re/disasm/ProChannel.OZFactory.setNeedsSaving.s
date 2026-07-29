__ZN9OZFactory14setNeedsSavingEb:
000000000001360c	pushq	%rbp
000000000001360d	movq	%rsp, %rbp
0000000000013610	pushq	%rbx
0000000000013611	pushq	%rax
0000000000013612	movl	%esi, %ebx
0000000000013614	callq	__ZN12_GLOBAL__N_127getThreadSpecificForFactoryEPK9OZFactory ## (anonymous namespace)::getThreadSpecificForFactory(OZFactory const*)
0000000000013619	movb	%bl, (%rax)
000000000001361b	addq	$0x8, %rsp
000000000001361f	popq	%rbx
0000000000013620	popq	%rbp
0000000000013621	retq
