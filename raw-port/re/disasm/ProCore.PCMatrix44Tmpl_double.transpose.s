__ZN14PCMatrix44TmplIdE9transposeEv:
000000000004ffd4	pushq	%rbp
000000000004ffd5	movq	%rsp, %rbp
000000000004ffd8	movq	%rdi, %rax
000000000004ffdb	movsd	0x20(%rdi), %xmm0
000000000004ffe0	movsd	0x8(%rdi), %xmm1
000000000004ffe5	movsd	0x10(%rdi), %xmm2
000000000004ffea	movsd	%xmm0, 0x8(%rdi)
000000000004ffef	movsd	%xmm1, 0x20(%rdi)
000000000004fff4	movsd	0x40(%rdi), %xmm0
000000000004fff9	movsd	%xmm0, 0x10(%rdi)
000000000004fffe	movsd	%xmm2, 0x40(%rdi)
0000000000050003	movsd	0x18(%rdi), %xmm0
0000000000050008	movsd	0x60(%rdi), %xmm1
000000000005000d	movsd	%xmm1, 0x18(%rdi)
0000000000050012	movsd	%xmm0, 0x60(%rdi)
0000000000050017	movsd	0x30(%rdi), %xmm0
000000000005001c	movsd	0x48(%rdi), %xmm1
0000000000050021	movsd	%xmm1, 0x30(%rdi)
0000000000050026	movsd	%xmm0, 0x48(%rdi)
000000000005002b	movsd	0x38(%rdi), %xmm0
0000000000050030	movsd	0x68(%rdi), %xmm1
0000000000050035	movsd	%xmm1, 0x38(%rdi)
000000000005003a	movsd	%xmm0, 0x68(%rdi)
000000000005003f	movsd	0x58(%rdi), %xmm0
0000000000050044	movsd	0x70(%rdi), %xmm1
0000000000050049	movsd	%xmm1, 0x58(%rdi)
000000000005004e	movsd	%xmm0, 0x70(%rdi)
0000000000050053	popq	%rbp
0000000000050054	retq
