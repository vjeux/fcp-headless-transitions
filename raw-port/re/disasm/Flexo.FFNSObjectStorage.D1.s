__ZN17FFNSObjectStorageD1Ev:
0000000000569a90	pushq	%rbp
0000000000569a91	movq	%rsp, %rbp
0000000000569a94	pushq	%rbx
0000000000569a95	pushq	%rax
0000000000569a96	movq	%rdi, %rbx
0000000000569a99	leaq	0x1394fd0(%rip), %rax
0000000000569aa0	movq	%rax, (%rdi)
0000000000569aa3	movq	0x10(%rdi), %rdi
0000000000569aa7	callq	*0x1383c5b(%rip)                ## literal pool symbol address: _objc_release
0000000000569aad	movq	%rbx, %rdi
0000000000569ab0	addq	$0x8, %rsp
0000000000569ab4	popq	%rbx
0000000000569ab5	popq	%rbp
0000000000569ab6	jmp	0x1496d86                       ## symbol stub for: __ZN8HGObjectD2Ev
0000000000569abb	movq	%rax, %rdi
0000000000569abe	callq	___clang_call_terminate
0000000000569ac3	nopw	%cs:(%rax,%rax)
