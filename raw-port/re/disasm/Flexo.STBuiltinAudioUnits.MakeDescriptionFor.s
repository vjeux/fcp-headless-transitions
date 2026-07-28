__ZN19STBuiltinAudioUnits18MakeDescriptionForEj:
0000000001251820	pushq	%rbp
0000000001251821	movq	%rsp, %rbp
0000000001251824	movq	%rdi, %rax
0000000001251827	movl	$0x61756d78, (%rdi)             ## imm = 0x61756D78
000000000125182d	movl	%esi, 0x4(%rdi)
0000000001251830	movq	$0x7461705f, 0x8(%rdi)          ## imm = 0x7461705F
0000000001251838	movl	$0x0, 0x10(%rdi)
000000000125183f	popq	%rbp
0000000001251840	retq
0000000001251841	nopw	%cs:(%rax,%rax)
