__ZN5HGHLG4OOTF23setPeakDisplayLuminanceEd:
00000000001000b0	pushq	%rbp
00000000001000b1	movq	%rsp, %rbp
00000000001000b4	pushq	%rbx
00000000001000b5	subq	$0x28, %rsp
00000000001000b9	movapd	%xmm0, %xmm2
00000000001000bd	ucomisd	0x2d0d23(%rip), %xmm0
00000000001000c5	movq	%rdi, %rbx
00000000001000c8	divsd	0x2cadb8(%rip), %xmm0
00000000001000d0	movapd	%xmm2, -0x30(%rbp)
00000000001000d5	jb	0x100100
00000000001000d7	movsd	0x2d0d11(%rip), %xmm1
00000000001000df	ucomisd	%xmm2, %xmm1
00000000001000e3	jb	0x100100
00000000001000e5	callq	0x3c53f0                        ## symbol stub for: _log10
00000000001000ea	movapd	%xmm0, %xmm1
00000000001000ee	mulsd	0x2d0d12(%rip), %xmm1
00000000001000f6	addsd	0x2d0d02(%rip), %xmm1
00000000001000fe	jmp	0x100122
0000000000100100	callq	0x3c53fc                        ## symbol stub for: _log2
0000000000100105	movapd	%xmm0, %xmm1
0000000000100109	movsd	0x2d0ce7(%rip), %xmm0
0000000000100111	callq	0x3c54ec                        ## symbol stub for: _pow
0000000000100116	movapd	%xmm0, %xmm1
000000000010011a	mulsd	0x2d0cde(%rip), %xmm1
0000000000100122	movsd	0x2ca1d6(%rip), %xmm0
000000000010012a	addsd	%xmm1, %xmm0
000000000010012e	movapd	%xmm0, -0x20(%rbp)
0000000000100133	movsd	0x2d0cd5(%rip), %xmm0
000000000010013b	callq	0x3c54ec                        ## symbol stub for: _pow
0000000000100140	movapd	-0x30(%rbp), %xmm1
0000000000100145	mulsd	%xmm0, %xmm1
0000000000100149	divsd	0x1a8(%rbx), %xmm1
0000000000100151	movapd	-0x20(%rbp), %xmm0
0000000000100156	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
000000000010015a	cvtpd2ps	%xmm0, %xmm0
000000000010015e	movlpd	%xmm0, 0x1b0(%rbx)
0000000000100166	addq	$0x28, %rsp
000000000010016a	popq	%rbx
000000000010016b	popq	%rbp
000000000010016c	retq
000000000010016d	nopl	(%rax)
