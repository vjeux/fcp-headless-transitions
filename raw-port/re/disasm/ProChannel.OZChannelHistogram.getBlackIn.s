__ZN18OZChannelHistogram10getBlackInEi:
00000000000703e6	pushq	%rbp
00000000000703e7	movq	%rsp, %rbp
00000000000703ea	cmpl	$0x4, %esi
00000000000703ed	ja	0x7042c
00000000000703ef	movq	%rdi, %rax
00000000000703f2	movl	%esi, %ecx
00000000000703f4	leaq	0x35(%rip), %rdx
00000000000703fb	movslq	(%rdx,%rcx,4), %rcx
00000000000703ff	addq	%rdx, %rcx
0000000000070402	jmpq	*%rcx
0000000000070404	addq	$0x210, %rax                    ## imm = 0x210
000000000007040a	jmp	0x7042e
000000000007040c	addq	$0x1010, %rax                   ## imm = 0x1010
0000000000070412	jmp	0x7042e
0000000000070414	addq	$0x910, %rax                    ## imm = 0x910
000000000007041a	jmp	0x7042e
000000000007041c	addq	$0xc90, %rax                    ## imm = 0xC90
0000000000070422	jmp	0x7042e
0000000000070424	addq	$0x590, %rax                    ## imm = 0x590
000000000007042a	jmp	0x7042e
000000000007042c	xorl	%eax, %eax
000000000007042e	popq	%rbp
000000000007042f	retq
0000000000070430	.byte 0xd4 #bad opcode
0000000000070431	.byte 0xff #bad opcode
0000000000070432	.byte 0xff #bad opcode
0000000000070433	pushq	%rsp
0000000000070435	.byte 0xff #bad opcode
0000000000070436	.byte 0xff #bad opcode
0000000000070437	jmpq	*%rsp
0000000000070439	.byte 0xff #bad opcode
000000000007043a	.byte 0xff #bad opcode
000000000007043b	.byte 0xff #bad opcode
000000000007043c	inb	%dx, %al
000000000007043d	.byte 0xff #bad opcode
000000000007043e	.byte 0xff #bad opcode
000000000007043f	.byte 0xff #bad opcode
0000000000070440	fdivr	%st, %st(7)
0000000000070442	.byte 0xff #bad opcode
0000000000070443	callq	*0x48(%rbp)
0000000000070446	movl	%esp, %ebp
0000000000070448	cmpl	$0x4, %esi
000000000007044b	ja	0x7048a
000000000007044d	movq	%rdi, %rax
0000000000070450	movl	%esi, %ecx
0000000000070452	leaq	0x37(%rip), %rdx
0000000000070459	movslq	(%rdx,%rcx,4), %rcx
000000000007045d	addq	%rdx, %rcx
0000000000070460	jmpq	*%rcx
0000000000070462	addq	$0x2a8, %rax                    ## imm = 0x2A8
0000000000070468	jmp	0x7048c
000000000007046a	addq	$0x10a8, %rax                   ## imm = 0x10A8
0000000000070470	jmp	0x7048c
0000000000070472	addq	$0x9a8, %rax                    ## imm = 0x9A8
0000000000070478	jmp	0x7048c
000000000007047a	addq	$0xd28, %rax                    ## imm = 0xD28
0000000000070480	jmp	0x7048c
0000000000070482	addq	$0x628, %rax                    ## imm = 0x628
0000000000070488	jmp	0x7048c
000000000007048a	xorl	%eax, %eax
000000000007048c	popq	%rbp
000000000007048d	retq
000000000007048e	nop
0000000000070490	sarb	%cl, %bh
0000000000070492	.byte 0xff #bad opcode
0000000000070493	pushq	%rdx
0000000000070495	.byte 0xff #bad opcode
0000000000070496	.byte 0xff #bad opcode
0000000000070497	jmpq	*%rdx
0000000000070499	.byte 0xff #bad opcode
000000000007049a	.byte 0xff #bad opcode
000000000007049b	.byte 0xff #bad opcode
000000000007049c	.byte 0xea #bad opcode
000000000007049d	.byte 0xff #bad opcode
000000000007049e	.byte 0xff #bad opcode
000000000007049f	.byte 0xff #bad opcode
00000000000704a0	.byte 0xda #bad opcode
00000000000704a1	.byte 0xff #bad opcode
00000000000704a2	.byte 0xff #bad opcode
00000000000704a3	callq	*0x48(%rbp)
00000000000704a6	movl	%esp, %ebp
00000000000704a8	cmpl	$0x4, %esi
00000000000704ab	ja	0x704ea
00000000000704ad	movq	%rdi, %rax
00000000000704b0	movl	%esi, %ecx
00000000000704b2	leaq	0x37(%rip), %rdx
00000000000704b9	movslq	(%rdx,%rcx,4), %rcx
00000000000704bd	addq	%rdx, %rcx
00000000000704c0	jmpq	*%rcx
00000000000704c2	addq	$0x340, %rax                    ## imm = 0x340
00000000000704c8	jmp	0x704ec
00000000000704ca	addq	$0x1140, %rax                   ## imm = 0x1140
00000000000704d0	jmp	0x704ec
00000000000704d2	addq	$0xa40, %rax                    ## imm = 0xA40
00000000000704d8	jmp	0x704ec
00000000000704da	addq	$0xdc0, %rax                    ## imm = 0xDC0
00000000000704e0	jmp	0x704ec
00000000000704e2	addq	$0x6c0, %rax                    ## imm = 0x6C0
00000000000704e8	jmp	0x704ec
00000000000704ea	xorl	%eax, %eax
00000000000704ec	popq	%rbp
00000000000704ed	retq
00000000000704ee	nop
00000000000704f0	sarb	%cl, %bh
00000000000704f2	.byte 0xff #bad opcode
00000000000704f3	pushq	%rdx
00000000000704f5	.byte 0xff #bad opcode
00000000000704f6	.byte 0xff #bad opcode
00000000000704f7	jmpq	*%rdx
00000000000704f9	.byte 0xff #bad opcode
00000000000704fa	.byte 0xff #bad opcode
00000000000704fb	.byte 0xff #bad opcode
00000000000704fc	.byte 0xea #bad opcode
00000000000704fd	.byte 0xff #bad opcode
00000000000704fe	.byte 0xff #bad opcode
00000000000704ff	.byte 0xff #bad opcode
0000000000070500	.byte 0xda #bad opcode
0000000000070501	.byte 0xff #bad opcode
0000000000070502	.byte 0xff #bad opcode
0000000000070503	callq	*0x48(%rbp)
0000000000070506	movl	%esp, %ebp
0000000000070508	cmpl	$0x4, %esi
000000000007050b	ja	0x7054a
000000000007050d	movq	%rdi, %rax
0000000000070510	movl	%esi, %ecx
0000000000070512	leaq	0x37(%rip), %rdx
0000000000070519	movslq	(%rdx,%rcx,4), %rcx
000000000007051d	addq	%rdx, %rcx
0000000000070520	jmpq	*%rcx
0000000000070522	addq	$0x3d8, %rax                    ## imm = 0x3D8
0000000000070528	jmp	0x7054c
000000000007052a	addq	$0x11d8, %rax                   ## imm = 0x11D8
0000000000070530	jmp	0x7054c
0000000000070532	addq	$0xad8, %rax                    ## imm = 0xAD8
0000000000070538	jmp	0x7054c
000000000007053a	addq	$0xe58, %rax                    ## imm = 0xE58
0000000000070540	jmp	0x7054c
0000000000070542	addq	$0x758, %rax                    ## imm = 0x758
0000000000070548	jmp	0x7054c
000000000007054a	xorl	%eax, %eax
000000000007054c	popq	%rbp
000000000007054d	retq
000000000007054e	nop
0000000000070550	sarb	%cl, %bh
0000000000070552	.byte 0xff #bad opcode
0000000000070553	pushq	%rdx
0000000000070555	.byte 0xff #bad opcode
0000000000070556	.byte 0xff #bad opcode
0000000000070557	jmpq	*%rdx
0000000000070559	.byte 0xff #bad opcode
000000000007055a	.byte 0xff #bad opcode
000000000007055b	.byte 0xff #bad opcode
000000000007055c	.byte 0xea #bad opcode
000000000007055d	.byte 0xff #bad opcode
000000000007055e	.byte 0xff #bad opcode
000000000007055f	.byte 0xff #bad opcode
0000000000070560	.byte 0xda #bad opcode
0000000000070561	.byte 0xff #bad opcode
0000000000070562	.byte 0xff #bad opcode
0000000000070563	callq	*0x48(%rbp)
0000000000070566	movl	%esp, %ebp
0000000000070568	cmpl	$0x4, %esi
000000000007056b	ja	0x705aa
000000000007056d	movq	%rdi, %rax
0000000000070570	movl	%esi, %ecx
0000000000070572	leaq	0x37(%rip), %rdx
0000000000070579	movslq	(%rdx,%rcx,4), %rcx
000000000007057d	addq	%rdx, %rcx
0000000000070580	jmpq	*%rcx
0000000000070582	addq	$0x470, %rax                    ## imm = 0x470
0000000000070588	jmp	0x705ac
000000000007058a	addq	$0x1270, %rax                   ## imm = 0x1270
0000000000070590	jmp	0x705ac
0000000000070592	addq	$0xb70, %rax                    ## imm = 0xB70
0000000000070598	jmp	0x705ac
000000000007059a	addq	$0xef0, %rax                    ## imm = 0xEF0
00000000000705a0	jmp	0x705ac
00000000000705a2	addq	$0x7f0, %rax                    ## imm = 0x7F0
00000000000705a8	jmp	0x705ac
00000000000705aa	xorl	%eax, %eax
00000000000705ac	popq	%rbp
00000000000705ad	retq
00000000000705ae	nop
00000000000705b0	sarb	%cl, %bh
00000000000705b2	.byte 0xff #bad opcode
00000000000705b3	pushq	%rdx
00000000000705b5	.byte 0xff #bad opcode
00000000000705b6	.byte 0xff #bad opcode
00000000000705b7	jmpq	*%rdx
00000000000705b9	.byte 0xff #bad opcode
00000000000705ba	.byte 0xff #bad opcode
00000000000705bb	.byte 0xff #bad opcode
00000000000705bc	.byte 0xea #bad opcode
00000000000705bd	.byte 0xff #bad opcode
00000000000705be	.byte 0xff #bad opcode
00000000000705bf	.byte 0xff #bad opcode
00000000000705c0	.byte 0xda #bad opcode
00000000000705c1	.byte 0xff #bad opcode
00000000000705c2	.byte 0xff #bad opcode
00000000000705c3	callq	*0x48(%rbp)
00000000000705c6	movl	%esp, %ebp
00000000000705c8	cmpl	$0x4, %esi
00000000000705cb	ja	0x705e6
00000000000705cd	imull	$0x380, %esi, %eax              ## imm = 0x380
00000000000705d3	addq	%rax, %rdi
00000000000705d6	addq	$0x210, %rdi                    ## imm = 0x210
00000000000705dd	movq	%rdx, %rsi
00000000000705e0	popq	%rbp
00000000000705e1	jmp	__ZNK9OZChannel16getValueAsDoubleERK6CMTimed ## OZChannel::getValueAsDouble(CMTime const&, double) const
00000000000705e6	xorps	%xmm0, %xmm0
00000000000705e9	popq	%rbp
00000000000705ea	retq
00000000000705eb	nop
