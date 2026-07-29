__ZN18OZAlignSimBehavior18calcReorientMatrixE6CMTimeP14PCMatrix33TmplIdE:
00000000003f1210	pushq	%rbp
00000000003f1211	movq	%rsp, %rbp
00000000003f1214	pushq	%rbx
00000000003f1215	pushq	%rax
00000000003f1216	movq	%rsi, %rbx
00000000003f1219	addq	$0x2f0, %rdi                    ## imm = 0x2F0
00000000003f1220	leaq	0x10(%rbp), %rsi
00000000003f1224	xorps	%xmm0, %xmm0
00000000003f1227	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000003f122c	cmpl	$0x2, %eax
00000000003f122f	je	0x3f1271
00000000003f1231	cmpl	$0x1, %eax
00000000003f1234	jne	0x3f126a
00000000003f1236	xorps	%xmm0, %xmm0
00000000003f1239	xorps	%xmm1, %xmm1
00000000003f123c	movhps	0x31419d(%rip), %xmm1           ## xmm1 = xmm1[0,1],mem[0,1]
00000000003f1243	movups	%xmm1, (%rbx)
00000000003f1246	movups	%xmm0, 0x30(%rbx)
00000000003f124a	xorps	%xmm1, %xmm1
00000000003f124d	movhps	0x3164d4(%rip), %xmm1           ## xmm1 = xmm1[0,1],mem[0,1]
00000000003f1254	movups	%xmm1, 0x10(%rbx)
00000000003f1258	movups	%xmm0, 0x20(%rbx)
00000000003f125c	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000003f1266	movq	%rax, 0x40(%rbx)
00000000003f126a	addq	$0x8, %rsp
00000000003f126e	popq	%rbx
00000000003f126f	popq	%rbp
00000000003f1270	retq
00000000003f1271	xorps	%xmm0, %xmm0
00000000003f1274	movups	%xmm0, (%rbx)
00000000003f1277	movsd	0x3164a9(%rip), %xmm0
00000000003f127f	movups	%xmm0, 0x30(%rbx)
00000000003f1283	movsd	0x314155(%rip), %xmm0
00000000003f128b	movups	%xmm0, 0x10(%rbx)
00000000003f128f	movups	%xmm0, 0x20(%rbx)
00000000003f1293	movq	$0x0, 0x40(%rbx)
00000000003f129b	addq	$0x8, %rsp
00000000003f129f	popq	%rbx
00000000003f12a0	popq	%rbp
00000000003f12a1	retq
00000000003f12a2	nopw	%cs:(%rax,%rax)
