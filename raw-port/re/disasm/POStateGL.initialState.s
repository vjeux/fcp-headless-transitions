__ZNK9POStateGL12initialStateEv:
00000000003461d0	pushq	%rbp
00000000003461d1	movq	%rsp, %rbp
00000000003461d4	pushq	%rbx
00000000003461d5	pushq	%rax
00000000003461d6	movq	%rdi, %rbx
00000000003461d9	movl	$0x1701, %edi                   ## imm = 0x1701
00000000003461de	callq	0x6dff18                        ## symbol stub for: _glMatrixMode
00000000003461e3	leaq	0x8(%rbx), %rdi
00000000003461e7	callq	0x6dff12                        ## symbol stub for: _glLoadMatrixf
00000000003461ec	movl	$0x1700, %edi                   ## imm = 0x1700
00000000003461f1	callq	0x6dff18                        ## symbol stub for: _glMatrixMode
00000000003461f6	leaq	0x48(%rbx), %rdi
00000000003461fa	callq	0x6dff12                        ## symbol stub for: _glLoadMatrixf
00000000003461ff	cmpb	$0x0, 0x88(%rbx)
0000000000346206	je	0x346273
0000000000346208	movl	$0xb71, %edi                    ## imm = 0xB71
000000000034620d	callq	0x6dfec4                        ## symbol stub for: _glEnable
0000000000346212	cmpb	$0x0, 0x94(%rbx)
0000000000346219	je	0x346286
000000000034621b	movl	$0xb50, %edi                    ## imm = 0xB50
0000000000346220	callq	0x6dfec4                        ## symbol stub for: _glEnable
0000000000346225	cmpb	$0x0, 0x95(%rbx)
000000000034622c	je	0x346299
000000000034622e	movl	$0xb20, %edi                    ## imm = 0xB20
0000000000346233	callq	0x6dfec4                        ## symbol stub for: _glEnable
0000000000346238	cmpb	$0x0, 0x8a(%rbx)
000000000034623f	je	0x3462ac
0000000000346241	movl	$0xbe2, %edi                    ## imm = 0xBE2
0000000000346246	callq	0x6dfec4                        ## symbol stub for: _glEnable
000000000034624b	cmpb	$0x0, 0x8b(%rbx)
0000000000346252	je	0x3462bf
0000000000346254	movl	$0xbd0, %edi                    ## imm = 0xBD0
0000000000346259	callq	0x6dfec4                        ## symbol stub for: _glEnable
000000000034625e	cmpb	$0x0, 0x8c(%rbx)
0000000000346265	je	0x3462d2
0000000000346267	movl	$0xba1, %edi                    ## imm = 0xBA1
000000000034626c	callq	0x6dfec4                        ## symbol stub for: _glEnable
0000000000346271	jmp	0x3462dc
0000000000346273	movl	$0xb71, %edi                    ## imm = 0xB71
0000000000346278	callq	0x6dfebe                        ## symbol stub for: _glDisable
000000000034627d	cmpb	$0x0, 0x94(%rbx)
0000000000346284	jne	0x34621b
0000000000346286	movl	$0xb50, %edi                    ## imm = 0xB50
000000000034628b	callq	0x6dfebe                        ## symbol stub for: _glDisable
0000000000346290	cmpb	$0x0, 0x95(%rbx)
0000000000346297	jne	0x34622e
0000000000346299	movl	$0xb20, %edi                    ## imm = 0xB20
000000000034629e	callq	0x6dfebe                        ## symbol stub for: _glDisable
00000000003462a3	cmpb	$0x0, 0x8a(%rbx)
00000000003462aa	jne	0x346241
00000000003462ac	movl	$0xbe2, %edi                    ## imm = 0xBE2
00000000003462b1	callq	0x6dfebe                        ## symbol stub for: _glDisable
00000000003462b6	cmpb	$0x0, 0x8b(%rbx)
00000000003462bd	jne	0x346254
00000000003462bf	movl	$0xbd0, %edi                    ## imm = 0xBD0
00000000003462c4	callq	0x6dfebe                        ## symbol stub for: _glDisable
00000000003462c9	cmpb	$0x0, 0x8c(%rbx)
00000000003462d0	jne	0x346267
00000000003462d2	movl	$0xba1, %edi                    ## imm = 0xBA1
00000000003462d7	callq	0x6dfebe                        ## symbol stub for: _glDisable
00000000003462dc	movzbl	0x89(%rbx), %edi
00000000003462e3	callq	0x6dfeb8                        ## symbol stub for: _glDepthMask
00000000003462e8	cvtsi2ssl	0x90(%rbx), %xmm0
00000000003462f0	callq	0x6dff06                        ## symbol stub for: _glLineWidth
00000000003462f5	movl	0xa0(%rbx), %esi
00000000003462fb	movl	0x98(%rbx), %edi
0000000000346301	movl	0x9c(%rbx), %edx
0000000000346307	movl	0xa4(%rbx), %ecx
000000000034630d	callq	0x6dfe9a                        ## symbol stub for: _glBlendFuncSeparate
0000000000346312	movl	0xa8(%rbx), %edi
0000000000346318	callq	0x6dff42                        ## symbol stub for: _glStencilMask
000000000034631d	movl	0xac(%rbx), %edi
0000000000346323	addq	$0x8, %rsp
0000000000346327	popq	%rbx
0000000000346328	popq	%rbp
0000000000346329	jmp	0x6dff18                        ## symbol stub for: _glMatrixMode
000000000034632e	nop
