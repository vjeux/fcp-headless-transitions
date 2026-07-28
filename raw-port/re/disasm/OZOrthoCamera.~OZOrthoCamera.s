__ZN13OZOrthoCameraD0Ev:
00000000000408e0	pushq	%rbp
00000000000408e1	movq	%rsp, %rbp
00000000000408e4	pushq	%rbx
00000000000408e5	pushq	%rax
00000000000408e6	movq	%rdi, %rbx
00000000000408e9	leaq	__ZTT13OZOrthoCamera(%rip), %rsi ## VTT for OZOrthoCamera
00000000000408f0	addq	$0x8, %rsi
00000000000408f4	callq	0x6ddc6e                        ## symbol stub for: __ZN14LiSimpleCameraD2Ev
00000000000408f9	leaq	__ZTV13PCShared_base(%rip), %rax ## vtable for PCShared_base
0000000000040900	addq	$0x10, %rax
0000000000040904	movq	%rax, 0x240(%rbx)
000000000004090b	movq	0x248(%rbx), %rdi
0000000000040912	testq	%rdi, %rdi
0000000000040915	je	0x4091c
0000000000040917	callq	0x6de4fc                        ## symbol stub for: __ZN18PC_Sp_counted_base12weak_releaseEv
000000000004091c	movq	%rbx, %rdi
000000000004091f	addq	$0x8, %rsp
0000000000040923	popq	%rbx
0000000000040924	popq	%rbp
0000000000040925	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000004092a	movq	%rax, %rdi
000000000004092d	callq	___clang_call_terminate
0000000000040932	nopw	%cs:(%rax,%rax)
