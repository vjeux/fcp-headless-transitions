__ZN13HGComicStroke11BindTextureEP9HGHandleri:
00000000001710b0	pushq	%rbp
00000000001710b1	movq	%rsp, %rbp
00000000001710b4	pushq	%r14
00000000001710b6	pushq	%rbx
00000000001710b7	subq	$0x10, %rsp
00000000001710bb	movl	%edx, %r14d
00000000001710be	movq	%rsi, %rbx
00000000001710c1	testl	%edx, %edx
00000000001710c3	je	0x1710d9
00000000001710c5	movq	%rbx, %rdi
00000000001710c8	movl	%r14d, %esi
00000000001710cb	xorl	%edx, %edx
00000000001710cd	xorl	%ecx, %ecx
00000000001710cf	xorl	%r8d, %r8d
00000000001710d2	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
00000000001710d7	jmp	0x17111c
00000000001710d9	movss	0x256bdf(%rip), %xmm0
00000000001710e1	divss	0x1a4(%rdi), %xmm0
00000000001710e9	movss	%xmm0, -0x14(%rbp)
00000000001710ee	movq	%rbx, %rdi
00000000001710f1	xorl	%esi, %esi
00000000001710f3	xorl	%edx, %edx
00000000001710f5	xorl	%ecx, %ecx
00000000001710f7	xorl	%r8d, %r8d
00000000001710fa	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
00000000001710ff	movss	-0x14(%rbp), %xmm0
0000000000171104	cvtss2sd	%xmm0, %xmm0
0000000000171108	movq	(%rbx), %rax
000000000017110b	movsd	0x25914d(%rip), %xmm2
0000000000171113	movq	%rbx, %rdi
0000000000171116	movaps	%xmm0, %xmm1
0000000000171119	callq	*0x68(%rax)
000000000017111c	movq	(%rbx), %rax
000000000017111f	movq	%rbx, %rdi
0000000000171122	movl	%r14d, %esi
0000000000171125	xorl	%edx, %edx
0000000000171127	callq	*0x48(%rax)
000000000017112a	movq	(%rbx), %rax
000000000017112d	movq	%rbx, %rdi
0000000000171130	xorl	%esi, %esi
0000000000171132	callq	*0x38(%rax)
0000000000171135	movq	(%rbx), %rax
0000000000171138	movq	%rbx, %rdi
000000000017113b	movl	$0x1, %esi
0000000000171140	movl	$0x1, %edx
0000000000171145	callq	*0x30(%rax)
0000000000171148	xorl	%eax, %eax
000000000017114a	addq	$0x10, %rsp
000000000017114e	popq	%rbx
000000000017114f	popq	%r14
0000000000171151	popq	%rbp
0000000000171152	retq
0000000000171153	nopw	%cs:(%rax,%rax)
