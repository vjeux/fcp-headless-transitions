__ZN22FFAudioDuckingClipInfoD1Ev:
0000000000376220	pushq	%rbp
0000000000376221	movq	%rsp, %rbp
0000000000376224	pushq	%rbx
0000000000376225	pushq	%rax
0000000000376226	movq	%rdi, %rbx
0000000000376229	movq	0x58(%rdi), %rdi
000000000037622d	callq	*0x15774d5(%rip)                ## literal pool symbol address: _objc_release
0000000000376233	movq	0x60(%rbx), %rdi
0000000000376237	callq	*0x15774cb(%rip)                ## literal pool symbol address: _objc_release
000000000037623d	addq	$0x8, %rsp
0000000000376241	popq	%rbx
0000000000376242	popq	%rbp
0000000000376243	retq
0000000000376244	movq	%rax, %rdi
0000000000376247	callq	___clang_call_terminate
000000000037624c	nopl	(%rax)
