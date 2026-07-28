__ZN13PCPixelFormat8setDepthENS_12ChannelOrderEjb:
0000000000035620	pushq	%rbp
0000000000035621	movq	%rsp, %rbp
0000000000035624	movl	%edi, %eax                              # eax = order (default return)
0000000000035626	testl	%edx, %edx                              # isFloat != 0 ?
0000000000035628	je	0x35654                                  # jmp if isFloat==0 (integer path)
000000000003562a	cmpl	$0x20, %esi                             # bits == 32 (float)?
000000000003562d	je	0x35671                                  # jmp -> 32-bit float table
000000000003562f	cmpl	$0x10, %esi                             # bits == 16 (half)?
0000000000035632	jne	0x356a5                                  # unsupported -> return unchanged
0000000000035634	leal	-0x1(%rax), %ecx                        # ecx = order - 1
0000000000035637	cmpl	$0x11, %ecx                             # order-1 < 17?
000000000003563a	setb	%dl                                     # dl = (order-1 < 17)
000000000003563d	movl	$0x1e3ff, %esi                          # mask
0000000000035642	shrl	%cl, %esi
0000000000035644	testb	%sil, %dl
0000000000035647	je	0x356a5                                  # if bit not set -> return unchanged
0000000000035649	movl	%ecx, %eax
000000000003564b	leaq	0xee8a6(%rip), %rcx                     # rcx = half-float target table @0x123ef8
0000000000035652	jmp	0x356a2
0000000000035654	cmpl	$0x10, %esi                             # bits == 16 (int)?
0000000000035657	je	0x35684                                  # jmp -> 16-bit int table
0000000000035659	cmpl	$0x8, %esi                              # bits == 8?
000000000003565c	jne	0x356a5                                  # unsupported -> unchanged
000000000003565e	leal	-0x7(%rax), %ecx                        # ecx = order - 7
0000000000035661	cmpl	$0xb, %ecx                              # ecx >= 11 -> unchanged
0000000000035664	jae	0x356a5
0000000000035666	movl	%ecx, %eax
0000000000035668	leaq	0xee901(%rip), %rcx                     # rcx = 8-bit int target table @0x123f70
000000000003566f	jmp	0x356a2
0000000000035671	leal	-0x1(%rax), %ecx                        # ecx = order - 1
0000000000035674	cmpl	$0xd, %ecx                              # ecx >= 13 -> unchanged
0000000000035677	jae	0x356a5
0000000000035679	movl	%ecx, %eax
000000000003567b	leaq	0xee8ba(%rip), %rcx                     # rcx = 32-bit float target table @0x123f3c
0000000000035682	jmp	0x356a2
0000000000035684	leal	-0x1(%rax), %ecx                        # ecx = order - 1
0000000000035687	cmpl	$0x11, %ecx                             # order-1 < 17?
000000000003568a	setb	%dl
000000000003568d	movl	$0x1fc3f, %esi                          # mask
0000000000035692	shrl	%cl, %esi
0000000000035694	testb	%sil, %dl
0000000000035697	je	0x356a5
0000000000035699	movl	%ecx, %eax
000000000003569b	leaq	0xee8fa(%rip), %rcx                     # rcx = 16-bit int target table @0x123f9c
00000000000356a2	movl	(%rcx,%rax,4), %eax                     # eax = table[index]
00000000000356a5	popq	%rbp
00000000000356a6	retq
